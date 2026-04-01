import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { ClientEntity } from './client.entity';

@Entity('invoices')
export class InvoiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  invoiceNumber: string;

  @Column({
    type: 'enum',
    enum: ['STANDARD', 'RECURRING', 'CREDIT_NOTE', 'DEPOSIT'],
  })
  type: string;

  @Column({
    type: 'enum',
    enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'],
    default: 'DRAFT',
  })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  taxRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  paidAmount: number;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  paidAt: Date;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  paymentReference: string;

  @Column({ type: 'jsonb' })
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    taxRate: number;
  }[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  terms: string;

  @Column({ nullable: true })
  projectId: string;

  @Column({ nullable: true })
  projectName: string;

  @Column({ type: 'jsonb', nullable: true })
  billingAddress: {
    company: string;
    contact: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    vatNumber: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  paymentTerms: {
    dueDays: number;
    lateFee: number;
    discountDays: number;
    discountPercentage: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    recurringPeriod?: string;
    nextInvoiceDate?: Date;
    endDate?: Date;
    autoSend: boolean;
  };

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  exchangeRate: number;

  @Column({ type: 'jsonb', nullable: true })
  attachments: {
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
  }[];

  @Column({ nullable: true })
  sentAt: Date;

  @Column({ nullable: true })
  reminderSentAt: Date;

  @Column({ default: 0 })
  reminderCount: number;

  @ManyToOne(() => ClientEntity, client => client.invoices)
  client: ClientEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
