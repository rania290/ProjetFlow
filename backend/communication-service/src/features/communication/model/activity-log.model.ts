import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  projectId: string;

  @Column()
  userId: string;

  @Column()
  userName: string;

  @Column()
  actionType: string; // e.g., 'TASK_CREATED', 'PROJECT_UPDATED', 'COMMENT_ADDED'

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any; // Extra info about the action

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
