import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  @Index()
  projectId: string;

  @Column({ type: 'varchar', nullable: true })
  @Index()
  authorId: string;

  @Column({ nullable: true })
  authorName: string;

  @Column({ nullable: true })
  authorAvatar: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  mentions: string[]; // List of mentioned user IDs

  @Column({ type: 'jsonb', nullable: true, default: [] })
  likes: string[]; // List of user IDs who liked the message

  @Column({ default: false })
  isPinned: boolean;

  @Column({ default: false })
  isEdited: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'jsonb', nullable: true })
  replyTo: {
    id: string;
    authorName: string;
    content: string;
  };

  @Column({ nullable: true })
  threadId: string; // For organized threads by project/topic

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
