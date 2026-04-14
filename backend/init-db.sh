#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE auth_db;
    CREATE DATABASE client_portal_db;
    CREATE DATABASE project_db;
    CREATE DATABASE reporting_db;
    CREATE DATABASE hr_db;
    CREATE DATABASE communication_db;
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "hr_db" <<-EOSQL
    CREATE TABLE IF NOT EXISTS leave_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id VARCHAR(255) NOT NULL,
        employee_name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'UNPAID')),
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        duration_days INTEGER NOT NULL CHECK (duration_days > 0),
        motif TEXT DEFAULT '',
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
        reviewed_by UUID,
        reviewed_at TIMESTAMP,
        rejection_reason TEXT,
        calendar_synced BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id);
    CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
    CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);
    CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_status ON leave_requests(employee_id, status);

    INSERT INTO leave_requests (employee_id, employee_name, type, start_date, end_date, duration_days, motif, status) VALUES
    ('emp-001', 'Jean Dupont', 'ANNUAL', '2026-04-10 09:00:00', '2026-04-14 18:00:00', 3, 'Vacances printanières', 'APPROVED'),
    ('emp-002', 'Marie Martin', 'SICK', '2026-04-05 08:00:00', '2026-04-05 18:00:00', 1, 'Maladie', 'APPROVED'),
    ('emp-003', 'Pierre Durand', 'PERSONAL', '2026-04-15 09:00:00', '2026-04-16 18:00:00', 2, 'Raison personnelle', 'PENDING'),
    ('emp-004', 'Sophie Bernard', 'MATERNITY', '2026-05-01 09:00:00', '2026-07-15 18:00:00', 75, 'Congé maternité', 'APPROVED')
    ON CONFLICT DO NOTHING;
EOSQL
