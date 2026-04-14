import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('documents')
export class DocumentEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    type: string;

    @Column()
    size: string;

    @Column({ nullable: true })
    author: string;

    @Column({ default: 'Général' })
    category: string;

    @Column({ nullable: true })
    projectId: string;

    @Column({ nullable: true })
    projectName: string;

    @Column()
    url: string;

    @CreateDateColumn()
    uploadedAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
