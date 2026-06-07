import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from '../db';
import { ProgressRow } from '../models/types';

/** GET /api/progress/:userId */
export async function getProgress(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;

  try {
    const rows = await query<ProgressRow>(
      'SELECT * FROM progress_entries WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );

    const entries = rows.map((r) => ({
      id: r.id,
      date: r.date,
      weight: Number(r.weight),
    }));

    res.json(entries);
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ error: 'Failed to fetch progress entries.' });
  }
}

/** POST /api/progress */
export async function addProgress(req: Request, res: Response): Promise<void> {
  const { userId, date, weight } = req.body as {
    userId: string;
    date: string;
    weight: number;
  };

  if (!userId || !date || weight === undefined) {
    res.status(400).json({ error: 'userId, date, and weight are required.' });
    return;
  }

  if (typeof weight !== 'number' || weight < 20 || weight > 500) {
    res.status(400).json({ error: 'Weight must be a number between 20 and 500 kg.' });
    return;
  }

  const id = uuidv4();

  try {
    await queryOne(
      'INSERT INTO progress_entries (id, user_id, date, weight) VALUES ($1, $2, $3, $4)',
      [id, userId, date, weight]
    );

    res.status(201).json({ id, date, weight });
  } catch (err: unknown) {
    // Unique constraint violation — duplicate date
    if ((err as { code?: string }).code === '23505') {
      res.status(409).json({ error: 'A weight entry already exists for this date.' });
      return;
    }
    console.error('Add progress error:', err);
    res.status(500).json({ error: 'Failed to add progress entry.' });
  }
}

/** PATCH /api/progress/:id */
export async function updateProgress(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { weight } = req.body as { weight: number };

  if (typeof weight !== 'number' || weight < 20 || weight > 500) {
    res.status(400).json({ error: 'Weight must be a number between 20 and 500 kg.' });
    return;
  }

  try {
    const existing = await queryOne<ProgressRow>(
      'SELECT id FROM progress_entries WHERE id = $1',
      [id]
    );
    if (!existing) {
      res.status(404).json({ error: 'Progress entry not found.' });
      return;
    }

    await queryOne('UPDATE progress_entries SET weight = $1 WHERE id = $2', [weight, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Update progress error:', err);
    res.status(500).json({ error: 'Failed to update progress entry.' });
  }
}

/** DELETE /api/progress/:id */
export async function deleteProgress(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    await queryOne('DELETE FROM progress_entries WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete progress error:', err);
    res.status(500).json({ error: 'Failed to delete progress entry.' });
  }
}
