import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { ClientEntity } from './client.entity';
import { TicketEntity } from './ticket.entity';

@Entity('projects')
export class ProjectEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: ['WEB_APPLICATION', 'MOBILE_APP', 'DESKTOP_APP', 'API', 'OTHER'],
        default: 'OTHER',
        nullable: true,
    })
    type: string;

    @Column({
        type: 'enum',
        enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED', 'PENDING', 'SUSPENDED'],
        default: 'PLANNED',
    })
    status: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    budget: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    progress: number;

    @Column({ nullable: true })
    startDate: Date;

    @Column({ nullable: true })
    endDate: Date;

    @Column({ nullable: true })
    managerName: string;

    @Column({ nullable: true })
    managerEmail: string;

    @Column({ type: 'text', nullable: true })
    requirements: string;

    @Column({ type: 'jsonb', nullable: true })
    technologies: string[];

    @Column({ type: 'jsonb', nullable: true })
    team: string[];

    @Column({ type: 'text', nullable: true })
    deliverables: string;

    @Column({ type: 'text', nullable: true })
    milestones: string;

    @Column({ type: 'jsonb', nullable: true })
    documents: {
        name: string;
        url: string;
        uploadedAt: Date;
        uploadedBy: string;
    }[];

    @Column({ type: 'jsonb', nullable: true })
    metadata: {
        clientRequirements: string;
        technicalSpecs: string;
        designAssets: string;
        testingPlan: string;
    };

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    clientAccessCode: string;

    @Column({ type: 'jsonb', nullable: true })
    clientPermissions: {
        viewTasks: boolean;
        viewDocuments: boolean;
        viewProgress: boolean;
        communicate: boolean;
    };

    @ManyToOne(() => ClientEntity, client => client.projects)
    client: ClientEntity;

    @OneToMany(() => TicketEntity, ticket => ticket.project)
    tickets: TicketEntity[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
