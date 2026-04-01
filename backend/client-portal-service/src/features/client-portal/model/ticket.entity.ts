import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { ClientEntity } from './client.entity';
import { ProjectEntity } from './project.entity';

@Entity('tickets')
export class TicketEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ['BUG', 'FEATURE_REQUEST', 'SUPPORT', 'QUESTION', 'IMPROVEMENT'],
  })
  type: string;

  @Column({
    type: 'enum',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM',
  })
  priority: string;

  @Column({
    type: 'enum',
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED'],
    default: 'OPEN',
  })
  status: string;

  @Column({ nullable: true })
  assignedTo: string;

  @Column({ nullable: true })
  assignedByEmail: string;

  @Column({ nullable: true })
  estimatedHours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  actualHours: number;

  @Column({ type: 'jsonb', nullable: true })
  attachments: {
    name: string;
    url: string;
    size: number;
    type: string;
    uploadedAt: Date;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  customFields: {
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  resolvedAt: Date;

  @Column({ nullable: true })
  resolution: string;

  @Column({ nullable: true })
  satisfaction: number; // 1-5 rating

  @Column({ nullable: true })
  satisfactionComment: string;

  @Column({ type: 'jsonb', nullable: true })
  timeline: {
    action: string;
    description: string;
    user: string;
    timestamp: Date;
  }[];

  @Column({ default: true })
  isPublic: boolean;

  @Column({ nullable: true })
  internalNotes: string;

  @Column({ nullable: true })
  clientReference: string;

  @ManyToOne(() => ClientEntity, client => client.tickets)
  client: ClientEntity;

  @ManyToOne(() => ProjectEntity, project => project.tickets)
  project: ProjectEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
