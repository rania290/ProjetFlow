import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './databases/database.module';
import { ProjectsModule } from './features/projects/projects.module';
import { RoleAssignmentsModule } from './features/role-assignments/role-assignments.module';
import { TasksModule } from './features/tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env', '../../.env'],
    }),
    DatabaseModule,
    ProjectsModule,
    RoleAssignmentsModule,
    TasksModule
  ],
})
export class AppModule { }

