-- Script d'initialisation pour toutes les bases de données Vaerdia
-- Exécuté automatiquement au démarrage du conteneur PostgreSQL

-- Création des bases de données
-- Note: Standard PostgreSQL doesn't support IF NOT EXISTS for CREATE DATABASE
-- These will fail if DB already exists, but that is expected behavior for this script
CREATE DATABASE auth_db;
CREATE DATABASE client_portal_db;
CREATE DATABASE project_db;
CREATE DATABASE reporting_db;
CREATE DATABASE hr_db;

-- Configuration des bases de données
\c auth_db;
-- Tables pour auth-service seront créées automatiquement par TypeORM

\c client_portal_db;
-- Tables pour client-portal-service seront créées automatiquement par TypeORM

\c project_db;
-- Tables pour project-service seront créées automatiquement par TypeORM

\c reporting_db;
-- Tables pour reporting-service seront créées automatiquement par TypeORM

\c hr_db;

-- Création de la table des demandes de congé pour HR Service
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(255) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'UNPAID')),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    motif TEXT DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    reviewed_by UUID,
    reviewed_at TIMESTAMP,
    rejection_reason TEXT,
    calendar_synced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_status ON leave_requests(employee_id, status);

-- Insertion de données de test
INSERT INTO leave_requests (employee_id, employee_name, type, start_date, end_date, duration_days, motif, status) VALUES
('emp-001', 'Jean Dupont', 'ANNUAL', '2026-04-10 09:00:00', '2026-04-14 18:00:00', 3, 'Vacances printanières', 'APPROVED'),
('emp-002', 'Marie Martin', 'SICK', '2026-04-05 08:00:00', '2026-04-05 18:00:00', 1, 'Maladie', 'APPROVED'),
('emp-003', 'Pierre Durand', 'PERSONAL', '2026-04-15 09:00:00', '2026-04-16 18:00:00', 2, 'Raison personnelle', 'PENDING'),
('emp-004', 'Sophie Bernard', 'MATERNITY', '2026-05-01 09:00:00', '2026-07-15 18:00:00', 75, 'Congé maternité', 'APPROVED')
ON CONFLICT DO NOTHING;

-- Affichage des résultats
SELECT 'Base de données Vaerdia créée avec succès' AS status;
SELECT 'hr_db' as database_name, COUNT(*) as total_leave_requests FROM hr_db.leave_requests;
