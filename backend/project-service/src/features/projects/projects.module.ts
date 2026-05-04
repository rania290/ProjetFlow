import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './controller/projects.controller';
import { PermissionsController } from './controller/permissions.controller';
import { ProjectsService } from './service/projects.service';
import { Project } from './model/projects.model';
import { RoleAssignmentsModule } from '../role-assignments/role-assignments.module';
import { TasksModule } from '../tasks/tasks.module';
import { SprintsModule } from '../sprints/sprints.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), RoleAssignmentsModule, TasksModule, SprintsModule],
  controllers: [ProjectsController, PermissionsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}

