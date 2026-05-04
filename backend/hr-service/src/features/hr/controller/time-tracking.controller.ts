import { Body, Controller, Get, Param, Post, Delete, UseGuards, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TimeTrackingService } from "../service/time-tracking.service";
import { StartTrackingDto, StopTrackingDto, PauseTrackingDto, ResumeTrackingDto, ManualCorrectionDto } from "../dto/time-tracking.dto";
import { JwtAuthGuard } from "../../../utils/auth/jwt-auth.guard";
import { RolesGuard } from "../../../utils/auth/roles.guard";
import { Roles } from "../../../utils/auth/roles.decorator";
import { LeaveRole } from "../constants/leave.constants";
import type { Response } from "express";

@ApiTags("Time Tracking")
@Controller("hr/time-tracking")
@UseGuards(JwtAuthGuard)
export class TimeTrackingController {
  constructor(private readonly timeService: TimeTrackingService) {}

  @Post("/start")
  async start(@Body() dto: StartTrackingDto) {
    return this.timeService.startSession(dto);
  }

  @Post("/pause")
  async pause(@Body() dto: PauseTrackingDto) {
    return this.timeService.pauseSession(dto.sessionId);
  }

  @Post("/resume")
  async resume(@Body() dto: ResumeTrackingDto) {
    return this.timeService.resumeSession(dto.sessionId);
  }

  @Post("/stop")
  async stop(@Body() dto: StopTrackingDto) {
    return this.timeService.stopSession(dto.sessionId);
  }

  @Get("/active/:employeeId")
  async getActive(@Param("employeeId") employeeId: string) {
    return this.timeService.getActiveSession(employeeId);
  }

  @Get("/history/:employeeId")
  async getHistory(@Param("employeeId") employeeId: string) {
    return this.timeService.getPersonalHistory(employeeId);
  }

  @Get("/team")
  @UseGuards(RolesGuard)
  @Roles(LeaveRole.MANAGER, LeaveRole.HR_ADMIN, LeaveRole.ADMIN, LeaveRole.SUPERADMIN, LeaveRole.SUPER_ADMIN)
  async getTeam() {
    return this.timeService.getTeamHistory();
  }

  @Get("/team/active")
  @UseGuards(RolesGuard)
  @Roles(LeaveRole.MANAGER, LeaveRole.HR_ADMIN, LeaveRole.ADMIN, LeaveRole.SUPERADMIN, LeaveRole.SUPER_ADMIN)
  async getTeamActive() {
    return this.timeService.getActiveTeam();
  }

  @Post("/manual-correction")
  @UseGuards(RolesGuard)
  @Roles(LeaveRole.HR_ADMIN, LeaveRole.ADMIN, LeaveRole.SUPERADMIN, LeaveRole.SUPER_ADMIN)
  async correctSession(@Body() dto: ManualCorrectionDto) {
    return this.timeService.manualCorrection(dto);
  }

  @Delete("/:id")
  async delete(@Param("id") id: string) {
    await this.timeService.deleteSession(id);
    return { success: true };
  }

  @Get("/export/csv")
  @UseGuards(RolesGuard)
  @Roles(LeaveRole.MANAGER, LeaveRole.HR_ADMIN, LeaveRole.ADMIN, LeaveRole.SUPERADMIN, LeaveRole.SUPER_ADMIN)
  async exportCsv(@Res() res: Response) {
    const history = await this.timeService.getTeamHistory();
    let csv = "ID,Employe,Date,Heure Arrivee,Heure Depart,Projet,Temps Pause (min),Temps Travail (min),Anomalie\n";
    history.forEach(h => {
        const start = h.startTime ? new Date(h.startTime).toLocaleTimeString() : '';
        const end = h.endTime ? new Date(h.endTime).toLocaleTimeString() : '';
        csv += `${h.id},"${h.employeeName}",${h.date},${start},${end},"${h.projectName || ''}",${h.totalPauseMinutes},${h.durationMinutes},${h.isAnomaly ? 'OUI' : 'NON'}\n`;
    });
    
    res.header('Content-Type', 'text/csv');
    res.attachment('pointages.csv');
    return res.send(csv);
  }
}
