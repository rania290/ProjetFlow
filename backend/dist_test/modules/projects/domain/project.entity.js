"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
class Project {
    id;
    name;
    type;
    managerId;
    clientId;
    members;
    status;
    budget;
    startDate;
    endDate;
    createdAt;
    updatedAt;
    constructor(id, name, type, managerId, clientId, members, status, budget, startDate, endDate, createdAt, updatedAt) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.managerId = managerId;
        this.clientId = clientId;
        this.members = members;
        this.status = status;
        this.budget = budget;
        this.startDate = startDate;
        this.endDate = endDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.Project = Project;
//# sourceMappingURL=project.entity.js.map