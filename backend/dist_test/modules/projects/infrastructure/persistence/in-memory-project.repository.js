"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryProjectRepository = void 0;
const common_1 = require("@nestjs/common");
let InMemoryProjectRepository = class InMemoryProjectRepository {
    projects = [];
    async create(project) {
        this.projects.push(project);
        return project;
    }
    async findById(id) {
        return this.projects.find((p) => p.id === id) ?? null;
    }
    async update(project) {
        const index = this.projects.findIndex((p) => p.id === project.id);
        if (index >= 0) {
            this.projects[index] = project;
        }
        else {
            this.projects.push(project);
        }
        return project;
    }
    async findByManager(managerId) {
        return this.projects.filter((p) => p.managerId === managerId);
    }
};
exports.InMemoryProjectRepository = InMemoryProjectRepository;
exports.InMemoryProjectRepository = InMemoryProjectRepository = __decorate([
    (0, common_1.Injectable)()
], InMemoryProjectRepository);
//# sourceMappingURL=in-memory-project.repository.js.map