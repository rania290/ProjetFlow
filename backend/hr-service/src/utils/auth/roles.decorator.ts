import { SetMetadata } from "@nestjs/common";
import { LeaveRole } from "../../features/hr/constants/leave.constants";

export const ROLES_KEY = "roles";
export const Roles = (...roles: LeaveRole[]) => SetMetadata(ROLES_KEY, roles);

