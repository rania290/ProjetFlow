import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleAssignment } from './model/role-assignment.model';
import { RoleAssignmentsController } from './controller/role-assignments.controller';
import { RoleAssignmentsService } from './service/role-assignments.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoleAssignment])],
  controllers: [RoleAssignmentsController],
  providers: [RoleAssignmentsService],
  exports: [RoleAssignmentsService],
})
export class RoleAssignmentsModule {}