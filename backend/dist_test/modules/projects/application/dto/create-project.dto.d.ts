export declare class ProjectMemberDto {
    userId: string;
    roleOnProject: string;
    dailyRate: number;
}
export declare class CreateProjectDto {
    name: string;
    type: 'SCRUM' | 'KANBAN';
    managerId: string;
    clientId?: string;
    budget: number;
    startDate: Date;
    endDate: Date;
    members: ProjectMemberDto[];
}
