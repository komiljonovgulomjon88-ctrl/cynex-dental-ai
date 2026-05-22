-- ============================================================
-- Cynex Dental AI — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── User Profiles ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  age              INTEGER,
  gender           TEXT CHECK (gender IN ('male','female','other')),
  has_braces       BOOLEAN DEFAULT FALSE,
  has_sensitivity  BOOLEAN DEFAULT FALSE,
  brushing_habit   TEXT,
  dental_issues    TEXT[] DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Scans ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scans (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Analysis Results ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analysis_results (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scan_id            UUID REFERENCES scans(id) ON DELETE CASCADE,
  user_id            UUID REFERENCES users(id) ON DELETE CASCADE,
  overall_risk       TEXT CHECK (overall_risk IN ('low','medium','high')),
  conditions         JSONB NOT NULL DEFAULT '[]',
  findings           JSONB NOT NULL DEFAULT '[]',
  ai_recommendation  TEXT,
  action_items       JSONB NOT NULL DEFAULT '[]',
  needs_dentist      BOOLEAN DEFAULT FALSE,
  image_urls         TEXT[] DEFAULT '{}',
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ── Reminders ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reminders (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  label      TEXT DEFAULT '',
  time       TEXT NOT NULL,        -- "HH:MM"
  days       INTEGER[] NOT NULL,   -- 0=Sun ... 6=Sat
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans           ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders       ENABLE ROW LEVEL SECURITY;

-- Users can only read their own row
CREATE POLICY "users: own row" ON users
  FOR ALL USING (auth.uid()::text = id::text);

-- Profiles: own data only
CREATE POLICY "profiles: own data" ON profiles
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Scans: own data only
CREATE POLICY "scans: own data" ON scans
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Analysis results: own data only
CREATE POLICY "analysis: own data" ON analysis_results
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Reminders: own data only
CREATE POLICY "reminders: own data" ON reminders
  FOR ALL USING (auth.uid()::text = user_id::text);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_user_id          ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_user_id             ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_user_id          ON analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_created          ON analysis_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id         ON reminders(user_id);

-- ── Done ──────────────────────────────────────────────────────────────────────
-- All tables created. Seed data is optional — the app creates data at runtime.
