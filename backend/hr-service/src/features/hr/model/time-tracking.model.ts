import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";

export enum TrackingStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED'
}

@Entity("time_tracking_sessions")
@Index(["employeeId", "date"])
export class TimeTrackingSession {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "employee_id" })
  @Index()
  employeeId!: string;

  @Column({ name: "employee_name" })
  employeeName!: string;

  @Column({ name: "project_id", type: "varchar", nullable: true })
  projectId!: string | null;

  @Column({ name: "project_name", type: "varchar", nullable: true })
  projectName!: string | null;

  @Column({ type: "date" })
  date!: string; // Format: YYYY-MM-DD

  @Column({ name: "start_time", type: "timestamp" })
  startTime!: Date;

  @Column({ name: "end_time", type: "timestamp", nullable: true })
  endTime!: Date | null;

  @Column({ type: "varchar", length: 20, default: TrackingStatus.IN_PROGRESS })
  status!: TrackingStatus;

  @Column({ name: "pause_start_time", type: "timestamp", nullable: true })
  pauseStartTime!: Date | null;

  @Column({ name: "total_pause_minutes", type: "integer", default: 0 })
  totalPauseMinutes!: number;

  @Column({ name: "duration_minutes", type: "integer", default: 0 })
  durationMinutes!: number;

  @Column({ type: "text", nullable: true })
  activity!: string;

  @Column({ name: "is_anomaly", type: "boolean", default: false })
  isAnomaly!: boolean;

  @Column({ name: "anomaly_reason", type: "text", nullable: true })
  anomalyReason!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
