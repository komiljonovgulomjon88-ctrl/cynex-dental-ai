-- ============================================================
-- Cynex Dental AI — Doctor Portal Tables Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id               TEXT PRIMARY KEY,
    email            TEXT UNIQUE NOT NULL,
    full_name        TEXT NOT NULL,
    password_hash    TEXT NOT NULL,
    specialty        TEXT NOT NULL,
    license_number   TEXT NOT NULL,
    clinic_name      TEXT DEFAULT '',
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (used by backend)
CREATE POLICY "Service role full access on doctors"
    ON doctors FOR ALL USING (true);

-- Doctor analyses table
CREATE TABLE IF NOT EXISTS doctor_analyses (
    id              TEXT PRIMARY KEY,
    doctor_id       TEXT REFERENCES doctors(id) ON DELETE CASCADE,
    patient_info    JSONB DEFAULT '{}',
    image_count     INTEGER DEFAULT 0,
    image_types     TEXT[] DEFAULT '{}',
    overall_risk    TEXT DEFAULT 'medium',
    clinical_data   JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_doctor_analyses_doctor_id ON doctor_analyses(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_analyses_created_at ON doctor_analyses(created_at DESC);

-- Enable RLS
ALTER TABLE doctor_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on doctor_analyses"
    ON doctor_analyses FOR ALL USING (true);

-- ============================================================
-- Verify tables created
-- ============================================================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('doctors', 'doctor_analyses');
