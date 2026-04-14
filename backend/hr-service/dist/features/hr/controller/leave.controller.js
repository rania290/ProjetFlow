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
exports.LeaveController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const leave_constants_1 = require("../constants/leave.constants");
const create_leave_dto_1 = require("../dto/create-leave.dto");
const review_leave_dto_1 = require("../dto/review-leave.dto");
const leave_service_1 = require("../service/leave.service");
const jwt_auth_guard_1 = require("../../../utils/auth/jwt-auth.guard");
const roles_guard_1 = require("../../../utils/auth/roles.guard");
const roles_decorator_1 = require("../../../utils/auth/roles.decorator");
let LeaveController = class LeaveController {
    leaveService;
    constructor(leaveService) {
        this.leaveService = leaveService;
    }
    async hello() {
        return { status: "ok", version: "debug-1" };
    }
    async getLeaves() {
        return this.leaveService.getLeaves();
    }
    async createLeaveRequest(dto) {
        return this.leaveService.createLeaveRequest(dto);
    }
    async getPendingLeaves(validatorId) {
        return this.leaveService.getPendingLeaves(validatorId);
    }
    async getLeavesByEmployee(employeeId) {
        return this.leaveService.getLeavesByEmployee(employeeId);
    }
    async getLeaveById(id) {
        return this.leaveService.getLeaveById(id);
    }
    async reviewLeaveRequest(id, dto) {
        return this.leaveService.reviewLeaveRequest(id, dto);
    }
};
exports.LeaveController = LeaveController;
__decorate([
    (0, common_1.Get)("/hello"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "hello", null);
__decorate([
    (0, common_1.Get)("/"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(leave_constants_1.LeaveRole.MANAGER, leave_constants_1.LeaveRole.HR_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getLeaves", null);
__decorate([
    (0, common_1.Post)("/"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(leave_constants_1.LeaveRole.EMPLOYEE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_leave_dto_1.CreateLeaveDto]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "createLeaveRequest", null);
__decorate([
    (0, common_1.Get)("/pending"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(leave_constants_1.LeaveRole.MANAGER, leave_constants_1.LeaveRole.HR_ADMIN),
    __param(0, (0, common_1.Query)("validatorId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getPendingLeaves", null);
__decorate([
    (0, common_1.Get)("/employee/:employeeId"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(leave_constants_1.LeaveRole.EMPLOYEE, leave_constants_1.LeaveRole.MANAGER),
    __param(0, (0, common_1.Param)("employeeId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getLeavesByEmployee", null);
__decorate([
    (0, common_1.Get)("/:id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(leave_constants_1.LeaveRole.EMPLOYEE, leave_constants_1.LeaveRole.MANAGER, leave_constants_1.LeaveRole.HR_ADMIN),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getLeaveById", null);
__decorate([
    (0, common_1.Patch)("/:id/review"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(leave_constants_1.LeaveRole.MANAGER, leave_constants_1.LeaveRole.HR_ADMIN),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, review_leave_dto_1.ReviewLeaveDto]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "reviewLeaveRequest", null);
exports.LeaveController = LeaveController = __decorate([
    (0, swagger_1.ApiTags)("HR Leaves"),
    (0, common_1.Controller)("hr/leaves"),
    __metadata("design:paramtypes", [leave_service_1.LeaveService])
], LeaveController);
//# sourceMappingURL=leave.controller.js.map