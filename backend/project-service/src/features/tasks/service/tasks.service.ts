import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../model/tasks.model';
import { CreateTaskDto, UpdateTaskDto } from '../dto/tasks.dto';
import { TaskStatus } from '../constants/tasks.constants';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const data: Partial<Task> = { ...createTaskDto } as any;
    delete (data as any).assigneeName;
    delete (data as any).assigneeAvatar;
    delete (data as any).subTasks;
    delete (data as any).comments;
    
    const task = this.taskRepository.create(data);
    return this.taskRepository.save(task);
  }

  async findAll(projectId?: string): Promise<Task[]> {
    const where = projectId ? { projectId } : {};
    return this.taskRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const updateData = { ...updateTaskDto } as any;
    
    // Remove virtual/frontend-only properties that are not in the DB entity
    delete updateData.assigneeName;
    delete updateData.assigneeAvatar;
    delete updateData.subTasks;
    delete updateData.comments;

    if (updateData.status === TaskStatus.DONE) {
        updateData.completedAt = new Date();
    }
    
    if (Object.keys(updateData).length > 0) {
        await this.taskRepository.update(id, updateData);
    }
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
  }
}
