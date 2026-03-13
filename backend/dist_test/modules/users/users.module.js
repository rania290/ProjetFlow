"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const in_memory_user_repository_1 = require("./infrastructure/persistence/in-memory-user.repository");
const user_repository_interface_1 = require("./domain/user-repository.interface");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        providers: [
            {
                provide: user_repository_interface_1.USER_REPOSITORY,
                useClass: in_memory_user_repository_1.InMemoryUserRepository,
            },
        ],
        exports: [user_repository_interface_1.USER_REPOSITORY],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map