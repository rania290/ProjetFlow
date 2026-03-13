"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const project_repository_interface_1 = require("./domain/project-repository.interface");
const project_entity_1 = require("./domain/project.entity");
const project_status_enum_1 = require("./domain/project-status.enum");
let ProjectsService = class ProjectsService {
    projectRepository;
    constructor(projectRepository) {
        this.projectRepository = projectRepository;
    }
    async create(dto) {
        const now = new Date();
        const members = dto.members.map((m) => ({
            userId: m.userId,
            roleOnProject: m.roleOnProject,
            dailyRate: m.dailyRate,
        }));
        const project = new project_entity_1.Project((0, uuid_1.v4)(), dto.name, dto.type, dto.managerId, dto.clientId ?? null, members, project_status_enum_1.ProjectStatus.PLANNED, dto.budget, dto.startDate, dto.endDate, now, now);
        return this.projectRepository.create(project);
    }
    async update(id, dto) {
        const project = await this.projectRepository.findById(id);
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        if (dto.name !== undefined)
            project.name = dto.name;
        if (dto.type !== undefined)
            project.type = dto.type;
        if (dto.managerId !== undefined)
            project.managerId = dto.managerId;
        if (dto.clientId !== undefined)
            project.clientId = dto.clientId ?? null;
        if (dto.budget !== undefined)
            project.budget = dto.budget;
        if (dto.startDate !== undefined)
            project.startDate = dto.startDate;
        if (dto.endDate !== undefined)
            project.endDate = dto.endDate;
        if (dto.status !== undefined)
            project.status = dto.status;
        project.updatedAt = new Date();
        return this.projectRepository.update(project);
    }
    async updateMembers(id, dto) {
        const project = await this.projectRepository.findById(id);
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        project.members = dto.members.map((m) => ({
            userId: m.userId,
            roleOnProject: m.roleOnProject,
            dailyRate: m.dailyRate,
        }));
        project.updatedAt = new Date();
        return this.projectRepository.update(project);
    }
    async updateStatus(id, status) {
        const project = await this.projectRepository.findById(id);
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        project.status = status;
        project.updatedAt = new Date();
        return this.projectRepository.update(project);
    }
    async getDashboardForManager(managerId) {
        const projects = await this.projectRepository.findByManager(managerId);
        return projects.map((p) => {
            const totalPlannedCost = p.budget;
            const totalActualCost = p.members.reduce((sum, m) => sum + m.dailyRate, 0);
            return {
                projectId: p.id,
                name: p.name,
                status: p.status,
                budget: p.budget,
                totalPlannedCost,
                totalActualCost,
                membersCount: p.members.length,
            };
        });
    }
    async findById(id) {
        return this.projectRepository.findById(id);
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(project_repository_interface_1.PROJECT_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map