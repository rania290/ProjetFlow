import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserRole } from '../constants/users.constants';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true, type: 'text' })
  profilePhoto: string;

  @Column({ default: 'fr' })
  preferredLanguage: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.DEVELOPER,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column("simple-array", { nullable: true })
  managerIds: string[];


  /**
   * Optional: Actually relate the manager for easier tree building later
   * if we want to use TypeORM's tree entities or just simple relations.
   */
  manager?: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

