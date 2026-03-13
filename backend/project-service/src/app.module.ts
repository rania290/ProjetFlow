import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './databases/database.module';
import { ProjectsModule } from './features/projects/projects.module';
import { RoleAssignmentsModule } from './features/role-assignments/role-assignments.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, ProjectsModule, RoleAssignmentsModule],
})
export class AppModule {}

