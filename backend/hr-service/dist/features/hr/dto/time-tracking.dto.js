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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManualCorrectionDto = exports.ResumeTrackingDto = exports.PauseTrackingDto = exports.StopTrackingDto = exports.StartTrackingDto = void 0;
const class_validator_1 = require("class-validator");
class StartTrackingDto {
    employeeId;
    employeeName;
    activity;
    projectId;
    projectName;
}
exports.StartTrackingDto = StartTrackingDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StartTrackingDto.prototype, "employeeId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StartTrackingDto.prototype, "employeeName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StartTrackingDto.prototype, "activity", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StartTrackingDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StartTrackingDto.prototype, "projectName", void 0);
class StopTrackingDto {
    sessionId;
}
exports.StopTrackingDto = StopTrackingDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StopTrackingDto.prototype, "sessionId", void 0);
class PauseTrackingDto {
    sessionId;
}
exports.PauseTrackingDto = PauseTrackingDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PauseTrackingDto.prototype, "sessionId", void 0);
class ResumeTrackingDto {
    sessionId;
}
exports.ResumeTrackingDto = ResumeTrackingDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ResumeTrackingDto.prototype, "sessionId", void 0);
class ManualCorrectionDto {
    sessionId;
    startTime;
    endTime;
    totalPauseMinutes;
    isAnomaly;
}
exports.ManualCorrectionDto = ManualCorrectionDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ManualCorrectionDto.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ManualCorrectionDto.prototype, "startTime", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ManualCorrectionDto.prototype, "endTime", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ManualCorrectionDto.prototype, "totalPauseMinutes", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ManualCorrectionDto.prototype, "isAnomaly", void 0);
//# sourceMappingURL=time-tracking.dto.js.map