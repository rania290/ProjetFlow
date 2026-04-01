import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectStatus, ProjectViewMode } from '../constants/projects.constants';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNED,
  })
  status: ProjectStatus;

  @Column({ type: 'varchar', length: 50, default: 'SCRUM' })
  type: string;

  @Column({ nullable: true })
  clientName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  budget: number;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ nullable: true })
  managerId: string;

  @Column({
    type: 'enum',
    enum: ProjectViewMode,
    default: ProjectViewMode.BOARD,
  })
  viewMode: ProjectViewMode;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

