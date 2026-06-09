-- SmartCoach Seed Data
-- Creates a demo user with sample data for local development.
-- Run: psql $DATABASE_URL -f sql/seed.sql
--
-- Demo credentials:
--   Email:    demo@smartcoach.local
--   Password: demo1234

-- The password hash below is bcrypt of "demo1234" with 10 rounds.
-- Generated with: bcrypt.hashSync('demo1234', 10)
INSERT INTO users (id, email, password_hash)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@smartcoach.local',
  '$2b$10$rOzJqhLzIzgqWepxT4Bh7.fBh0bJfPbqOQqJhRLPYBLxg5vFlrXCy'
)
ON CONFLICT (email) DO NOTHING;

-- Demo profile
INSERT INTO profiles (user_id, name, gender, weight, height, age, activity_level, goal, target_weight)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo User',
  'male',
  85.0,
  180.0,
  28,
  'moderate',
  'weight_loss',
  78.0
)
ON CONFLICT (user_id) DO NOTHING;

-- Sample weight entries (last 14 days)
INSERT INTO progress_entries (user_id, date, weight) VALUES
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 13, 85.5),
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 11, 85.2),
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 9,  84.9),
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 7,  84.7),
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 5,  84.4),
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 3,  84.1),
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 1,  83.9)
ON CONFLICT (user_id, date) DO NOTHING;

-- Sample workout sessions
INSERT INTO workouts (user_id, date, exercises, notes) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  CURRENT_DATE - 6,
  '[
    {"id":"ex-1","name":"Bench Press","muscleGroup":"chest","sets":4,"reps":10,"weightKg":70},
    {"id":"ex-2","name":"Incline Dumbbell Press","muscleGroup":"chest","sets":3,"reps":12,"weightKg":30},
    {"id":"ex-3","name":"Cable Flyes","muscleGroup":"chest","sets":3,"reps":15,"weightKg":20}
  ]',
  'Good chest session, felt strong'
),
(
  '00000000-0000-0000-0000-000000000001',
  CURRENT_DATE - 4,
  '[
    {"id":"ex-4","name":"Pull-ups","muscleGroup":"back","sets":4,"reps":8,"weightKg":0},
    {"id":"ex-5","name":"Barbell Row","muscleGroup":"back","sets":4,"reps":10,"weightKg":80},
    {"id":"ex-6","name":"Lat Pulldown","muscleGroup":"back","sets":3,"reps":12,"weightKg":65}
  ]',
  'Back day'
),
(
  '00000000-0000-0000-0000-000000000001',
  CURRENT_DATE - 2,
  '[
    {"id":"ex-7","name":"Squat","muscleGroup":"legs","sets":5,"reps":5,"weightKg":100},
    {"id":"ex-8","name":"Leg Press","muscleGroup":"legs","sets":4,"reps":12,"weightKg":150},
    {"id":"ex-9","name":"Running","muscleGroup":"cardio","duration":20}
  ]',
  'Leg day + cardio'
);
