import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server';
import { pool } from '../db';

afterAll(async () => {
  await pool.end();
});

describe('Workout validation — POST /api/workouts', () => {
  it('rejects missing userId', async () => {
    const res = await request(app)
      .post('/api/workouts')
      .send({
        date: '2024-01-01',
        exercises: [{ id: '1', name: 'Push-up', muscleGroup: 'chest', sets: 3, reps: 10, weightKg: 0 }],
        notes: '',
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it('rejects empty exercises array', async () => {
    const res = await request(app)
      .post('/api/workouts')
      .send({ userId: 'test-id', date: '2024-01-01', exercises: [], notes: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/exercise/i);
  });

  it('rejects exercise without name', async () => {
    const res = await request(app)
      .post('/api/workouts')
      .send({
        userId: 'test-id',
        date: '2024-01-01',
        exercises: [{ id: '1', name: '', muscleGroup: 'chest', sets: 3, reps: 10, weightKg: 0 }],
        notes: '',
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name/i);
  });

  it('rejects cardio exercise with duration < 1', async () => {
    const res = await request(app)
      .post('/api/workouts')
      .send({
        userId: 'test-id',
        date: '2024-01-01',
        exercises: [{ id: '1', name: 'Running', muscleGroup: 'cardio', duration: 0 }],
        notes: '',
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/duration/i);
  });

  it('rejects strength exercise with sets < 1', async () => {
    const res = await request(app)
      .post('/api/workouts')
      .send({
        userId: 'test-id',
        date: '2024-01-01',
        exercises: [{ id: '1', name: 'Squat', muscleGroup: 'legs', sets: 0, reps: 10, weightKg: 0 }],
        notes: '',
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/sets/i);
  });

  it('rejects strength exercise with reps < 1', async () => {
    const res = await request(app)
      .post('/api/workouts')
      .send({
        userId: 'test-id',
        date: '2024-01-01',
        exercises: [{ id: '1', name: 'Squat', muscleGroup: 'legs', sets: 3, reps: 0, weightKg: 0 }],
        notes: '',
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/reps/i);
  });
});
