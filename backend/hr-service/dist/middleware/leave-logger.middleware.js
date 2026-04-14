"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveLoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
let LeaveLoggerMiddleware = class LeaveLoggerMiddleware {
    use(req, _res, next) {
        const method = req.method;
        const url = req.originalUrl || req.url;
        const timestamp = new Date().toISOString();
        const authHeader = req.headers["authorization"];
        const bearerUserId = authHeader?.startsWith("Bearer ") ? authHeader.substring("Bearer ".length).trim() : undefined;
        const userId = req.headers["x-user-id"] || bearerUserId || "anonymous";
        console.log(`[HR-SERVICE] ${method} ${url} — user:${userId} — ${timestamp}`);
        next();
    }
};
exports.LeaveLoggerMiddleware = LeaveLoggerMiddleware;
exports.LeaveLoggerMiddleware = LeaveLoggerMiddleware = __decorate([
    (0, common_1.Injectable)()
], LeaveLoggerMiddleware);
//# sourceMappingURL=leave-logger.middleware.js.map