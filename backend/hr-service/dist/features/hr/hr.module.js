"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HrModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
const database_module_1 = require("../../databases/database.module");
const leave_controller_1 = require("./controller/leave.controller");
const leave_request_model_1 = require("./model/leave-request.model");
const leave_service_1 = require("./service/leave.service");
const leave_logger_middleware_1 = require("../../middleware/leave-logger.middleware");
let HrModule = class HrModule {
    configure(consumer) {
        consumer
            .apply(leave_logger_middleware_1.LeaveLoggerMiddleware)
            .forRoutes({ path: "hr/leaves", method: common_1.RequestMethod.ALL });
    }
};
exports.HrModule = HrModule;
exports.HrModule = HrModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_module_1.DatabaseModule,
            event_emitter_1.EventEmitterModule.forRoot(),
            typeorm_1.TypeOrmModule.forFeature([leave_request_model_1.LeaveRequest]),
        ],
        controllers: [leave_controller_1.LeaveController],
        providers: [
            leave_service_1.LeaveService,
            {
                provide: 'REDIS_CLIENT',
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    return new ioredis_1.default({
                        host: configService.get('REDIS_HOST') || 'localhost',
                        port: configService.get('REDIS_PORT') || 6379,
                    });
                },
            },
        ],
        exports: [leave_service_1.LeaveService, 'REDIS_CLIENT'],
    })
], HrModule);
//# sourceMappingURL=hr.module.js.map