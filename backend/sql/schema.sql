-- SmartCoach Database Schema
-- Run: psql $DATABASE_URL -f sql/schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email        TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Profiles ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  gender        TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  weight        NUMERIC(5,1) NOT NULL,
  height        NUMERIC(5,1) NOT NULL,
  age           INTEGER NOT NULL,
  activity_level TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal          TEXT NOT NULL CHECK (goal IN ('weight_loss', 'weight_gain', 'maintenance')),
  target_weight NUMERIC(5,1) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Workout Sessions ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workouts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  exercises  JSONB NOT NULL DEFAULT '[]',
  notes      TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date DESC);

-- ── Progress / Weight Entries ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS progress_entries (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  weight     NUMERIC(5,1) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_progress_user_date ON progress_entries(user_id, date DESC);

-- ── Agent Logs ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('workout-coach', 'nutrition-progress')),
  request    JSONB NOT NULL DEFAULT '{}',
  response   JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_logs_user ON agent_logs(user_id, created_at DESC);
