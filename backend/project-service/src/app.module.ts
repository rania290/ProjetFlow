import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { DatabaseModule } from './databases/database.module';
import { ProjectsModule } from './features/projects/projects.module';
import { RoleAssignmentsModule } from './features/role-assignments/role-assignments.module';
import { TasksModule } from './features/tasks/tasks.module';
import { TaskTimelogsModule } from './features/task-timelogs/task-timelogs.module';
import { StorageModule } from './features/storage/storage.module';
import { SprintsModule } from './features/sprints/sprints.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env', '../../.env'],
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, '..', '..', '..', 'uploads'),
      serveRoot: '/storage/files',
      serveStaticOptions: {
        index: false,
      },
    }),
    DatabaseModule,
    ProjectsModule,
    RoleAssignmentsModule,
    TasksModule,
    TaskTimelogsModule,
    StorageModule,
    SprintsModule,
  ],
})
export class AppModule { }

