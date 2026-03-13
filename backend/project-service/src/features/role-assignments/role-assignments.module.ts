import { Module } from '@nestjs/common';
import { RoleAssignmentsController } from './controller/role-assignments.controller';
import { RoleAssignmentsService } from './service/role-assignments.service';

@Module({
  controllers: [RoleAssignmentsController],
  providers: [RoleAssignmentsService],
  exports: [RoleAssignmentsService],
})
export class RoleAssignmentsModule {}