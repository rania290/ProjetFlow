import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './controller/projects.controller';
import { PermissionsController } from './controller/permissions.controller';
import { ProjectsService } from './service/projects.service';
import { Project } from './model/projects.model';
import { RoleAssignmentsModule } from '../role-assignments/role-assignments.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), RoleAssignmentsModule],
  controllers: [ProjectsController, PermissionsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}

