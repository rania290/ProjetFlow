import { Body, Controller, Get, Param, Patch, Post, UseGuards, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { LeaveRole } from "../constants/leave.constants";
import { CreateLeaveDto } from "../dto/create-leave.dto";
import { LeaveResponseDto } from "../dto/leave-response.dto";
import { ReviewLeaveDto } from "../dto/review-leave.dto";
import { LeaveService } from "../service/leave.service";
import { JwtAuthGuard } from "../../../utils/auth/jwt-auth.guard";
import { RolesGuard } from "../../../utils/auth/roles.guard";
import { Roles } from "../../../utils/auth/roles.decorator";

@ApiTags("HR Leaves")
@Controller("hr/leaves")
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) { }

  @Get("/hello")
  async hello() {
    return { status: "ok", version: "debug-1" };
  }

  @Get("/")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(LeaveRole.MANAGER, LeaveRole.HR_ADMIN, LeaveRole.ADMIN, LeaveRole.ROOT, LeaveRole.SUPERADMIN, LeaveRole.SUPER_ADMIN)
  async getLeaves(): Promise<LeaveResponseDto[]> {
    return this.leaveService.getLeaves();
  }

  @Post("/")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    LeaveRole.EMPLOYEE, LeaveRole.MANAGER, LeaveRole.HR_ADMIN,
    LeaveRole.ADMIN, LeaveRole.ROOT, LeaveRole.SUPERADMIN, LeaveRole.SUPER_ADMIN,
    LeaveRole.DEVELOPER, LeaveRole.DESIGNER, LeaveRole.TESTER,
    LeaveRole.PROJECT_MANAGER, LeaveRole.TEAM_MEMBER,
  )
  async createLeaveRequest(@Body() dto: CreateLeaveDto): Promise<LeaveResponseDto> {
    return this.leaveService.createLeaveRequest(dto);
  }

  @Get("/pending")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(LeaveRole.MANAGER, LeaveRole.HR_ADMIN)
  async getPendingLeaves(@Query("validatorId") validatorId?: string): Promise<LeaveResponseDto[]> {
    return this.leaveService.getPendingLeaves(validatorId);
  }

  @Get("/employee/:employeeId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    LeaveRole.EMPLOYEE, LeaveRole.MANAGER, LeaveRole.HR_ADMIN,
    LeaveRole.ADMIN, LeaveRole.ROOT, LeaveRole.SUPERADMIN, LeaveRole.SUPER_ADMIN,
    LeaveRole.DEVELOPER, LeaveRole.DESIGNER, LeaveRole.TESTER,
    LeaveRole.PROJECT_MANAGER, LeaveRole.TEAM_MEMBER,
  )
  async getLeavesByEmployee(@Param("employeeId") employeeId: string): Promise<LeaveResponseDto[]> {
    return this.leaveService.getLeavesByEmployee(employeeId);
  }

  @Get("/check-overlaps")
  @UseGuards(JwtAuthGuard)
  async checkOverlaps(
    @Query("startDate") start: string,
    @Query("endDate") end: string,
    @Query("excludeEmployeeId") excludeId: string
  ): Promise<{ overlappingEmployees: string[] }> {
    const overlaps = await this.leaveService.checkOverlappingEmployees(new Date(start), new Date(end), excludeId);
    return { overlappingEmployees: overlaps };
  }

  @Get("/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    LeaveRole.EMPLOYEE, LeaveRole.MANAGER, LeaveRole.HR_ADMIN,
    LeaveRole.ADMIN, LeaveRole.ROOT, LeaveRole.SUPERADMIN, LeaveRole.SUPER_ADMIN,
    LeaveRole.DEVELOPER, LeaveRole.DESIGNER, LeaveRole.TESTER,
    LeaveRole.PROJECT_MANAGER, LeaveRole.TEAM_MEMBER,
  )
  async getLeaveById(@Param("id") id: string): Promise<LeaveResponseDto> {
    return this.leaveService.getLeaveById(id);
  }

  @Patch("/:id/review")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(LeaveRole.MANAGER, LeaveRole.HR_ADMIN)
  async reviewLeaveRequest(@Param("id") id: string, @Body() dto: ReviewLeaveDto): Promise<LeaveResponseDto> {
    return this.leaveService.reviewLeaveRequest(id, dto);
  }
}

