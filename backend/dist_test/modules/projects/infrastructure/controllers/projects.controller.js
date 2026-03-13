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
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const projects_service_1 = require("../../projects.service");
const create_project_dto_1 = require("../../application/dto/create-project.dto");
const update_project_dto_1 = require("../../application/dto/update-project.dto");
const update_members_dto_1 = require("../../application/dto/update-members.dto");
const project_status_enum_1 = require("../../domain/project-status.enum");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../../../auth/infrastructure/security/roles.guard");
const roles_decorator_1 = require("../../../auth/infrastructure/security/roles.decorator");
const user_role_enum_1 = require("../../../users/domain/user-role.enum");
let ProjectsController = class ProjectsController {
    projectsService;
    constructor(projectsService) {
        this.projectsService = projectsService;
    }
    create(dto) {
        return this.projectsService.create(dto);
    }
    update(id, dto) {
        return this.projectsService.update(id, dto);
    }
    updateMembers(id, dto) {
        return this.projectsService.updateMembers(id, dto);
    }
    updateStatus(id, status) {
        return this.projectsService.updateStatus(id, status);
    }
    async dashboardForManager(req) {
        return this.projectsService.getDashboardForManager(req.user.id);
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ROOT, user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un projet avec cadrage complet' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Projet créé' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_project_dto_1.CreateProjectDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ROOT, user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour les données de cadrage du projet' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_project_dto_1.UpdateProjectDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/members'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ROOT, user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Affecter / modifier les membres du projet' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_members_dto_1.UpdateMembersDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "updateMembers", null);
__decorate([
    (0, common_1.Patch)(':id/status/:status'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ROOT, user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Changer le statut du projet' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)('dashboard/me'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ROOT, user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Consulter le dashboard synthétique des projets du chef de projet connecté' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "dashboardForManager", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, swagger_1.ApiTags)('projects'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map