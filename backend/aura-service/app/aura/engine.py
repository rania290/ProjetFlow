import os
import json
import logging
from datetime import datetime, timedelta
from sqlalchemy import text
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from .models import AuraAlert, AuraReport
from ..database import SessionLocal

logger = logging.getLogger(__name__)

# Utilisation de Groq Llama 3.1 (Gratuit, Ultra-Rapide, Sans Limite)
llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0)

async def get_project_context(project_id: str) -> dict:
    try:
        with SessionLocal() as db:
            tasks_result = db.execute(text("""
                SELECT t.id, t.title, t.status, t."dueDate", t."assignee_id", t."storyPoints", ra.user_full_name as assignee_name
                FROM tasks t
                LEFT JOIN role_assignments ra ON t.assignee_id::text = ra.user_id::text AND ra.project_id::text = :pid
                WHERE t.project_id = :pid
            """), {"pid": project_id}).mappings().all()
            
            try:
                sprints_result = db.execute(text("""
                    SELECT id, name, "startDate", "endDate", status
                    FROM sprints WHERE project_id = :pid AND status = 'ACTIVE'
                """), {"pid": project_id}).mappings().all()
            except Exception as e:
                logger.warning(f"Error fetching sprints: {e}")
                db.rollback()
                sprints_result = []

            project_result = db.execute(text("""
                SELECT name, budget, progress, "endDate", "startDate", status, description, "clientName" 
                FROM projects WHERE id = :pid
            """), {"pid": project_id}).mappings().first()

            try:
                workload_result = db.execute(text("""
                    SELECT ra.user_id as member_id, ra.user_full_name as name, ra.role,
                           COUNT(t.id) as task_count, 
                           SUM(COALESCE(t."storyPoints", 0)) as total_points,
                           SUM(COALESCE(t."estimatedHours", 0)) as hours_week
                    FROM role_assignments ra
                    LEFT JOIN tasks t ON ra.user_id = t.assignee_id AND t.status != 'DONE'
                    WHERE ra.project_id = :pid AND ra.is_active = true
                    GROUP BY ra.user_id, ra.user_full_name, ra.role
                """), {"pid": project_id}).mappings().all()
            except Exception as e:
                logger.warning(f"Error fetching workload: {e}")
                db.rollback()
                workload_result = []

        return {
            "project": dict(project_result) if project_result else {},
            "tasks": [dict(t) for t in tasks_result],
            "sprints": [dict(s) for s in sprints_result],
            "workload": [dict(w) for w in workload_result]
        }
    except Exception as e:
        logger.error(f"CRITICAL ERROR in get_project_context: {e}")
        import traceback
        traceback.print_exc()
        raise e

async def detect_late_tasks(project_id: str) -> list[dict]:
    with SessionLocal() as db:
        late_tasks = db.execute(text("""
            SELECT t.id as task_id, t.title, ra.user_full_name as assignee_name, t."dueDate" as due_date,
                   EXTRACT(DAY FROM (NOW() - t."dueDate")) as days_late,
                   p.name as project_name
            FROM tasks t
            JOIN projects p ON t.project_id::text = p.id::text
            LEFT JOIN role_assignments ra ON t.assignee_id::text = ra.user_id::text AND ra.project_id::text = :pid
            WHERE t.project_id = :pid AND t.status != 'DONE' AND t."dueDate" < NOW()
        """), {"pid": project_id}).mappings().all()
        
    return [dict(t) for t in late_tasks]

async def detect_at_risk_sprints(project_id: str) -> list[dict]:
    try:
        with SessionLocal() as db:
            # A sprint is at risk if it's ACTIVE and end_date is near with pending tasks
            at_risk = db.execute(text("""
                SELECT s.id, s.name, s."endDate",
                       (SELECT COUNT(*) FROM tasks t WHERE t.sprint_id::uuid = s.id AND t.status != 'DONE') as pending_tasks
                FROM sprints s
                WHERE s.project_id = :pid AND s.status = 'ACTIVE' AND s."endDate" < NOW() + INTERVAL '3 days'
            """), {"pid": project_id}).mappings().all()
            
        return [dict(s) for s in at_risk]
    except Exception as e:
        logger.warning(f"Sprints table not available or error: {e}")
        return []

async def analyze_project_progress(project_id: str) -> dict:
    context = await get_project_context(project_id)
    tasks = context.get("tasks", [])
    total = len(tasks)
    
    # Align calculation with frontend: DONE=1, IN_TEST=0.9, IN_PROGRESS=0.5
    completed_effort = 0
    done_count = 0
    for t in tasks:
        if t["status"] == "DONE":
            completed_effort += 1
            done_count += 1
        elif t["status"] == "IN_TEST":
            completed_effort += 0.9
        elif t["status"] == "IN_PROGRESS":
            completed_effort += 0.5
            
    completion_pct = (completed_effort / total * 100) if total > 0 else context.get("project", {}).get("progress", 0)
    
    late = await detect_late_tasks(project_id)
    at_risk_sprints = await detect_at_risk_sprints(project_id)
    
    return {
        "completion_pct": completion_pct,
        "tasks_done": done_count,
        "tasks_total": total,
        "tasks_late": len(late),
        "sprint_health": "at_risk" if len(at_risk_sprints) > 0 else "on_track",
        "budget_consumed_pct": context.get("project", {}).get("progress", 0), # Using progress as proxy for now
        "team_workload": context.get("workload", []),
        "at_risk_sprints": at_risk_sprints
    }

async def chat(user_message: str, project_id: str, user_id: str = "system") -> str:
    try:
        context = await get_project_context(project_id)
        late_tasks = await detect_late_tasks(project_id)
        analysis = await analyze_project_progress(project_id)
        
        today = datetime.now().strftime("%Y-%m-%d")
        project_name = context.get("project", {}).get("name", "Inconnu")
        
        full_context = {
            "context": context,
            "late_tasks": late_tasks,
            "analysis": analysis
        }
        
        system_prompt = f"""Tu es Aura, l'assistant IA intelligent de VAERDIA ProjectFlow.
Tu as accès aux données en temps réel du projet, mais tu dois te comporter comme un interlocuteur humain naturel.

Données actuelles du projet "{project_name}" au {today} (POUR INFORMATION UNIQUEMENT) :
{json.dumps(full_context, default=str, ensure_ascii=False)}

Règles de comportement strictes :
1. RÉPONDS UNIQUEMENT À LA QUESTION POSÉE. Ne fais pas un résumé global du projet si l'utilisateur ne l'a pas explicitement demandé.
2. Si l'utilisateur dit simplement "Bonjour" ou te salue, réponds de manière courtoise et courte en te présentant, sans donner de chiffres sur le projet.
3. Ne mentionne les retards, l'avancement ou le budget que si la question de l'utilisateur porte sur ces sujets.
4. Sois direct, clair et professionnel en français. Utilise les données du contexte ci-dessus pour construire tes réponses factuelles.
5. Si on te demande une action technique (créer, modifier en base de données), dis que tu ne peux que conseiller et que l'utilisateur doit le faire via l'interface.
6. Si l'utilisateur demande des suggestions de tâches, des idées de décomposition ou des étapes techniques pour une User Story, propose une liste structurée et pertinente de 3 à 6 tâches concrètes en utilisant ton expertise Agile.
7. ANALYSE DE CHARGE ET RECOMMANDATION : Si l'utilisateur te demande qui est disponible, qui devrait faire une tâche, ou quelle est la charge de l'équipe, utilise les données de "team_workload" dans le contexte. Recommande le membre le plus pertinent (celui avec le moins de story points ou de tâches, tout en respectant son rôle) et justifie clairement ton choix par des chiffres.
8. RÈGLE CRUCIALE : Ne montre JAMAIS d'identifiants techniques (IDs, UUIDs) à l'utilisateur dans tes réponses. Utilise TOUJOURS les noms (ex: "Jean Dupont") pour désigner les membres de l'équipe ou les titres pour les tâches.
9. RAPPORTS HEBDOMADAIRES : Si l'utilisateur demande "où est le rapport", "génère un rapport" ou "montre moi le suivi hebdomadaire", explique-lui que les rapports détaillés générés par l'IA sont disponibles dans l'onglet "RAPPORTS" juste au-dessus de cette fenêtre de chat. Ne confonds pas cela avec les tâches de développement du projet qui pourraient avoir "Rapport" dans leur titre.
"""
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_message)
        ]
        
        try:
            response = await llm.ainvoke(messages)
            return response.content
        except Exception as ai_err:
            logger.error(f"OpenAI Error: {ai_err}")
            return f"Désolé, je rencontre des difficultés techniques avec OpenAI : {str(ai_err)}"
            
    except Exception as e:
        logger.error(f"GENERAL ERROR in chat function: {e}")
        import traceback
        traceback.print_exc()
        return "Désolé, une erreur interne empêche Aura de vous répondre."

async def get_weekly_stats(project_id: str) -> dict:
    try:
        seven_days_ago = datetime.now() - timedelta(days=7)
        with SessionLocal() as db:
            # Tasks completed this week
            completed_this_week = db.execute(text("""
                SELECT t.id, t.title, t."completedAt", ra.user_full_name as assignee_name
                FROM tasks t
                LEFT JOIN role_assignments ra ON t.assignee_id = ra.user_id AND ra.project_id = :pid
                WHERE t.project_id = :pid AND t.status = 'DONE' AND t."completedAt" >= :since
            """), {"pid": project_id, "since": seven_days_ago}).mappings().all()

            # Tasks created this week
            created_this_week = db.execute(text("""
                SELECT id, title, created_at
                FROM tasks 
                WHERE project_id = :pid AND created_at >= :since
            """), {"pid": project_id, "since": seven_days_ago}).mappings().all()

            # New blockers (tasks late since last week)
            new_late = db.execute(text("""
                SELECT id, title, "dueDate"
                FROM tasks 
                WHERE project_id = :pid AND status != 'DONE' AND "dueDate" BETWEEN :since AND NOW()
            """), {"pid": project_id, "since": seven_days_ago}).mappings().all()

        return {
            "completed_count": len(completed_this_week),
            "completed_items": [dict(t) for t in completed_this_week],
            "created_count": len(created_this_week),
            "new_late_count": len(new_late),
            "new_late_items": [dict(t) for t in new_late]
        }
    except Exception as e:
        logger.error(f"Error in get_weekly_stats: {e}")
        return {"error": str(e)}

async def generate_weekly_report(project_id: str) -> dict:
    try:
        analysis = await analyze_project_progress(project_id)
        weekly_stats = await get_weekly_stats(project_id)
        context = await get_project_context(project_id)
        
        project_name = context.get("project", {}).get("name", "Projet")
        
        report_data = {
            "overall_progress": analysis,
            "weekly_stats": weekly_stats,
            "sprints": context.get("sprints", [])
        }

        # Conversion sécurisée en JSON (UTF-8)
        try:
            report_data_json = json.dumps(report_data, default=str, ensure_ascii=False)
        except Exception as json_err:
            logger.warning(f"JSON encoding issue, falling back to ascii: {json_err}")
            report_data_json = json.dumps(report_data, default=str)

        system_prompt = f"""Tu es Aura AI, expert en management de projet. 
Ta mission est de générer un rapport hebdomadaire professionnel, encourageant et factuel pour le projet "{project_name}".

Données de la semaine :
{report_data_json}

Le rapport doit être au format Markdown et contenir les sections suivantes :
1. 📈 **État Global** : Résumé rapide de l'avancement.
2. ✅ **Réalisations de la Semaine** : Ce qui a été terminé (basé sur completed_items).
3. ⚠️ **Points d'Attention & Risques** : Tâches en retard ou sprints à risque.
4. 💡 **Recommandations d'Aura** : Conseils concrets pour la semaine prochaine.

Sois précis, utilise un ton professionnel mais dynamique. Réponds en Français."""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content="Génère le rapport hebdomadaire pour mon équipe.")
        ]

        response = await llm.ainvoke(messages)
        content = response.content
        summary = f"Rapport de la semaine : {weekly_stats['completed_count']} tâches terminées, {weekly_stats['new_late_count']} nouvelles alertes."

        with SessionLocal() as db:
            try:
                metrics_json = json.dumps(report_data, default=str, ensure_ascii=False)
            except:
                metrics_json = json.dumps(report_data, default=str)
                
            report = AuraReport(
                project_id=project_id,
                content=content,
                summary=summary,
                metrics=metrics_json
            )
            db.add(report)
            db.commit()
            db.refresh(report)
            
            return {
                "id": str(report.id),
                "project_id": project_id,
                "content": content,
                "summary": summary,
                "created_at": report.created_at.isoformat()
            }

    except Exception as e:
        logger.error(f"Error generating weekly report: {e}")
        import traceback
        traceback.print_exc()
        return {"error": "Échec de la génération du rapport."}

async def get_quick_insights(project_id: str) -> list[str]:
    try:
        context = await get_project_context(project_id)
        late = await detect_late_tasks(project_id)
        at_risk = await detect_at_risk_sprints(project_id)
        analysis = await analyze_project_progress(project_id)
        
        insights = []
        
        if len(late) > 0:
            insights.append(f"{len(late)} tâches sont en retard — la plus critique : {late[0]['title']}")
        
        if len(at_risk) > 0:
            insights.append(f"Sprint '{at_risk[0]['name']}' est à risque — finit le {at_risk[0]['end_date'].strftime('%d/%m')}")
        
        if analysis['completion_pct'] > 0:
            insights.append(f"Avancement global : {analysis['completion_pct']:.1f}%")
        
        if not insights:
            insights.append("Tout semble sur les rails. Continuez comme ça !")
            
        return insights[:3]
    except Exception as e:
        logger.error(f"Error in get_quick_insights: {e}")
        return ["Aura est prêt à vous aider. Posez-moi une question !"]

async def suggest_tasks_for_story(title: str, description: str) -> list[str]:
    try:
        system_prompt = """Tu es un expert en gestion de projet Agile. 
L'utilisateur va te donner le titre et la description d'une User Story.
Ta mission est de décomposer cette User Story en 3 à 6 tâches techniques et concrètes.
Réponds UNIQUEMENT avec une liste de tâches, une par ligne, sans numérotation, sans introduction ni conclusion.
Chaque tâche doit être courte (moins de 10 mots)."""
        
        user_prompt = f"User Story: {title}\nDescription: {description}"
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        
        response = await llm.ainvoke(messages)
        # Nettoyage de la réponse pour ne garder que les lignes de texte
        tasks = [line.strip().lstrip('- ').lstrip('* ') for line in response.content.split('\n') if line.strip()]
        return tasks[:6] # Maximum 6 suggestions
    except Exception as e:
        logger.error(f"Error in suggest_tasks_for_story: {e}")
        return ["Analyse des besoins", "Conception technique", "Développement", "Tests unitaires"]

async def recommend_assignee(project_id: str, task_title: str, task_description: str) -> dict:
    try:
        with SessionLocal() as db:
            # 1. Get all project members
            members_result = db.execute(text("""
                SELECT "user_id" as id, "user_full_name" as name, role 
                FROM role_assignments 
                WHERE project_id = :pid AND is_active = true
            """), {"pid": project_id}).mappings().all()
            
            members = [dict(m) for m in members_result]
            
            if not members:
                return {"error": "Aucun membre trouvé pour ce projet."}
            
            # 2. Get current workload for each member
            workload_data = {}
            tasks_result = db.execute(text("""
                SELECT "assignee_id", status, "storyPoints", title
                FROM tasks 
                WHERE project_id = :pid AND status != 'DONE'
            """), {"pid": project_id}).mappings().all()
            
            for m in members:
                m_id = m['id']
                m_tasks = [t for t in tasks_result if t['assignee_id'] == m_id]
                workload_data[m_id] = {
                    "name": m['name'],
                    "role": m['role'],
                    "task_count": len(m_tasks),
                    "total_points": sum(t['storyPoints'] or 0 for t in m_tasks),
                    "current_tasks": [t['title'] for t in m_tasks[:3]] # Just sample
                }
        
        # 3. Use LLM to analyze and recommend
        system_prompt = """Tu es un expert en gestion de ressources Agile. 
Ta mission est de recommander le membre de l'équipe le plus adapté pour une nouvelle tâche, en te basant sur leur charge de travail actuelle et leur rôle.

Données de l'équipe (Charge de travail actuelle) :
{workload_json}

Nouvelle tâche :
Titre : {title}
Description : {description}

Critères de recommandation :
1. Disponibilité : Privilégie ceux qui ont le moins de points ou de tâches en cours.
2. Équité : Essaie de répartir la charge équitablement.
3. Pertinence : Si le rôle (ex: DEVELOPER, DESIGNER) semble plus adapté, prends-le en compte.

Réponds UNIQUEMENT au format JSON avec les clés suivantes :
- "recommended_id": l'ID du membre recommandé
- "recommended_name": le nom du membre recommandé
- "justification": une explication courte et convaincante (en français, max 2 phrases)."""

        workload_json = json.dumps(workload_data, ensure_ascii=False)
        user_prompt = f"Analyse et recommande pour : {task_title}"
        
        messages = [
            SystemMessage(content=system_prompt.format(
                workload_json=workload_json, 
                title=task_title, 
                description=task_description
            )),
            HumanMessage(content=user_prompt)
        ]
        
        response = await llm.ainvoke(messages)
        
        # Parse JSON response
        try:
            content = response.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            recommendation = json.loads(content)
            return recommendation
        except Exception as json_err:
            logger.error(f"Failed to parse LLM response for recommendation: {json_err} | Content: {response.content}")
            # Fallback to simplest heuristic if LLM fails
            best_member = min(members, key=lambda m: workload_data[m['id']]['total_points'])
            return {
                "recommended_id": best_member['id'],
                "recommended_name": best_member['name'],
                "justification": f"Recommandé en raison de sa charge de travail actuelle la plus faible ({workload_data[best_member['id']]['total_points']} pts)."
            }
            
    except Exception as e:
        logger.error(f"Error in recommend_assignee: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}
