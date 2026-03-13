import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './controller/projects.controller';
import { RoleAssignmentsController } from './controller/role-assignments.controller';
import { PermissionsController } from './controller/permissions.controller';
import { ProjectsService } from './service/projects.service';
import { Project } from './model/projects.model';

@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  controllers: [ProjectsController, RoleAssignmentsController, PermissionsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}

