import { Project } from '../../domain/project.entity';
import { ProjectRepository } from '../../domain/project-repository.interface';
export declare class InMemoryProjectRepository implements ProjectRepository {
    private projects;
    create(project: Project): Promise<Project>;
    findById(id: string): Promise<Project | null>;
    update(project: Project): Promise<Project>;
    findByManager(managerId: string): Promise<Project[]>;
}
