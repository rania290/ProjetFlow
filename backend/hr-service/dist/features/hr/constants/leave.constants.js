"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveRole = exports.LeaveType = exports.LeaveStatus = void 0;
var LeaveStatus;
(function (LeaveStatus) {
    LeaveStatus["PENDING"] = "PENDING";
    LeaveStatus["APPROVED"] = "APPROVED";
    LeaveStatus["REJECTED"] = "REJECTED";
})(LeaveStatus || (exports.LeaveStatus = LeaveStatus = {}));
var LeaveType;
(function (LeaveType) {
    LeaveType["ANNUAL"] = "ANNUAL";
    LeaveType["SICK"] = "SICK";
    LeaveType["PERSONAL"] = "PERSONAL";
    LeaveType["MATERNITY"] = "MATERNITY";
    LeaveType["PATERNITY"] = "PATERNITY";
    LeaveType["UNPAID"] = "UNPAID";
})(LeaveType || (exports.LeaveType = LeaveType = {}));
var LeaveRole;
(function (LeaveRole) {
    LeaveRole["EMPLOYEE"] = "EMPLOYEE";
    LeaveRole["MANAGER"] = "MANAGER";
    LeaveRole["HR_ADMIN"] = "HR_ADMIN";
    LeaveRole["ADMIN"] = "ADMIN";
    LeaveRole["ROOT"] = "ROOT";
    LeaveRole["SUPERADMIN"] = "SUPERADMIN";
})(LeaveRole || (exports.LeaveRole = LeaveRole = {}));
//# sourceMappingURL=leave.constants.js.map