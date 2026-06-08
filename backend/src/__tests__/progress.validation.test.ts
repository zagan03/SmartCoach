import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server';
import { pool } from '../db';

afterAll(async () => {
  await pool.end();
});

// These tests validate the progress controller's input validation logic.
// They do NOT require a real database connection.

describe('Progress validation — POST /api/progress', () => {
  it('rejects missing userId', async () => {
    const res = await request(app)
      .post('/api/progress')
      .send({ date: '2024-01-01', weight: 75 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it('rejects missing date', async () => {
    const res = await request(app)
      .post('/api/progress')
      .send({ userId: 'test-id', weight: 75 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it('rejects missing weight', async () => {
    const res = await request(app)
      .post('/api/progress')
      .send({ userId: 'test-id', date: '2024-01-01' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it('rejects weight below 20 kg', async () => {
    const res = await request(app)
      .post('/api/progress')
      .send({ userId: 'test-id', date: '2024-01-01', weight: 10 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/20/);
  });

  it('rejects weight above 500 kg', async () => {
    const res = await request(app)
      .post('/api/progress')
      .send({ userId: 'test-id', date: '2024-01-01', weight: 999 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/500/);
  });

  it('rejects string weight', async () => {
    const res = await request(app)
      .post('/api/progress')
      .send({ userId: 'test-id', date: '2024-01-01', weight: 'heavy' });
    expect(res.status).toBe(400);
  });
});

describe('Progress validation — PATCH /api/progress/:id', () => {
  it('rejects weight below 20 kg on update', async () => {
    const res = await request(app)
      .patch('/api/progress/some-id')
      .send({ weight: 5 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/20/);
  });

  it('rejects weight above 500 kg on update', async () => {
    const res = await request(app)
      .patch('/api/progress/some-id')
      .send({ weight: 600 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/500/);
  });
});
