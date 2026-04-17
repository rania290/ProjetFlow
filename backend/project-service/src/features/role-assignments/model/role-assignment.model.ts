import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('role_assignments')
export class RoleAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Auth-service user UUID */
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'user_full_name', nullable: true })
  userFullName: string;

  @Column({ name: 'user_email', nullable: true })
  userEmail: string;

  /** Project UUID (references projects.id in same DB) */
  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ name: 'project_name', nullable: true })
  projectName: string;

  @Column({ default: 'TEAM_MEMBER' })
  role: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ nullable: true })
  notes: string;

  @Column({ name: 'assigned_by', nullable: true })
  assignedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
