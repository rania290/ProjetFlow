import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { LeaveStatus, LeaveType } from "../constants/leave.constants";

@Entity("leave_requests")
@Index(["employeeId", "status"])
export class LeaveRequest {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "employee_id", nullable: true })
  @Index()
  employeeId!: string;

  @Column({ name: "employee_name", nullable: true })
  employeeName!: string;

  @Column({
    type: "enum",
    enum: LeaveType,
    name: "type",
    nullable: true
  })
  type!: LeaveType;

  @Column({ name: "start_date", type: "timestamp", nullable: true })
  startDate!: Date;

  @Column({ name: "end_date", type: "timestamp", nullable: true })
  endDate!: Date;

  @Column({ name: "duration_days", type: "integer", nullable: true })
  durationDays!: number;

  @Column({ name: "motif", type: "text", default: "" })
  motif!: string;

  @Column({
    type: "enum",
    enum: LeaveStatus,
    default: LeaveStatus.PENDING,
    name: "status"
  })
  @Index()
  status!: LeaveStatus;

  @Column("uuid", { name: "manager_id", nullable: true })
  managerId!: string | null;

  @Column("simple-array", { name: "manager_ids", nullable: true })
  managerIds!: string[];


  @Column("uuid", { name: "current_validator_id", nullable: true })
  currentValidatorId!: string | null;

  @Column({ name: "validation_step", type: "integer", default: 1 })
  validationStep!: number;

  @Column({ name: "reviewed_by", type: "text", nullable: true })
  reviewedBy!: string | null;

  @Column({ name: "reviewed_at", type: "timestamp", nullable: true })
  reviewedAt!: Date | null;

  @Column({ name: "rejection_reason", type: "text", nullable: true })
  rejectionReason!: string | null;

  @Column({ name: "calendar_synced", type: "boolean", default: false })
  calendarSynced!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}

