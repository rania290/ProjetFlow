import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sprint } from '../model/sprints.model';
import { CreateSprintDto, UpdateSprintDto } from '../dto/sprints.dto';

@Injectable()
export class SprintsService {
  constructor(
    @InjectRepository(Sprint)
    private readonly sprintRepository: Repository<Sprint>,
  ) {}

  async create(createSprintDto: CreateSprintDto): Promise<Sprint> {
    const sprint = this.sprintRepository.create(createSprintDto);
    return this.sprintRepository.save(sprint);
  }

  async findAll(projectId?: string): Promise<Sprint[]> {
    if (projectId) {
      return this.sprintRepository.find({ where: { projectId } });
    }
    return this.sprintRepository.find();
  }

  async findOne(id: string): Promise<Sprint> {
    const sprint = await this.sprintRepository.findOne({ where: { id } });
    if (!sprint) {
      throw new NotFoundException(`Sprint with ID ${id} not found`);
    }
    return sprint;
  }

  async update(id: string, updateSprintDto: UpdateSprintDto): Promise<Sprint> {
    await this.findOne(id);
    await this.sprintRepository.update(id, updateSprintDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const sprint = await this.findOne(id);
    await this.sprintRepository.remove(sprint);
  }
}
