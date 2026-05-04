import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskTimelog } from './model/task-timelog.model';
import { TaskTimelogService } from './service/task-timelog.service';
import { TaskTimelogController } from './controller/task-timelog.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TaskTimelog])],
  controllers: [TaskTimelogController],
  providers: [TaskTimelogService],
  exports: [TaskTimelogService],
})
export class TaskTimelogsModule {}
