import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from '../db';
import { WorkoutRow, Exercise } from '../models/types';

/** GET /api/workouts/:userId */
export async function getWorkouts(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;

  try {
    const rows = await query<WorkoutRow>(
      'SELECT * FROM workouts WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );

    const sessions = rows.map((r) => ({
      id: r.id,
      date: r.date,
      exercises: r.exercises,
      notes: r.notes || '',
    }));

    res.json(sessions);
  } catch (err) {
    console.error('Get workouts error:', err);
    res.status(500).json({ error: 'Failed to fetch workouts.' });
  }
}

/** POST /api/workouts */
export async function createWorkout(req: Request, res: Response): Promise<void> {
  const { userId, date, exercises, notes } = req.body as {
    userId: string;
    date: string;
    exercises: Exercise[];
    notes: string;
  };

  if (!userId || !date || !exercises) {
    res.status(400).json({ error: 'userId, date, and exercises are required.' });
    return;
  }

  // Validate exercises
  if (!Array.isArray(exercises) || exercises.length === 0) {
    res.status(400).json({ error: 'At least one exercise is required.' });
    return;
  }

  for (const ex of exercises) {
    if (!ex.name) {
      res.status(400).json({ error: 'All exercises must have a name.' });
      return;
    }
    if (ex.muscleGroup === 'cardio') {
      if (!ex.duration || ex.duration < 1) {
        res.status(400).json({ error: 'Cardio exercise duration must be at least 1 minute.' });
        return;
      }
    } else {
      if (!ex.sets || ex.sets < 1) {
        res.status(400).json({ error: 'Sets must be at least 1.' });
        return;
      }
      if (!ex.reps || ex.reps < 1) {
        res.status(400).json({ error: 'Reps must be at least 1.' });
        return;
      }
    }
  }

  const id = uuidv4();

  try {
    await queryOne(
      'INSERT INTO workouts (id, user_id, date, exercises, notes) VALUES ($1, $2, $3, $4, $5)',
      [id, userId, date, JSON.stringify(exercises), notes || '']
    );

    res.status(201).json({ id, date, exercises, notes: notes || '' });
  } catch (err) {
    console.error('Create workout error:', err);
    res.status(500).json({ error: 'Failed to create workout.' });
  }
}

/** PUT /api/workouts/:id */
export async function updateWorkout(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { date, exercises, notes } = req.body as {
    date: string;
    exercises: Exercise[];
    notes: string;
  };

  try {
    const existing = await queryOne<WorkoutRow>('SELECT id FROM workouts WHERE id = $1', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Workout not found.' });
      return;
    }

    await queryOne(
      'UPDATE workouts SET date = $1, exercises = $2, notes = $3 WHERE id = $4',
      [date, JSON.stringify(exercises), notes || '', id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Update workout error:', err);
    res.status(500).json({ error: 'Failed to update workout.' });
  }
}

/** DELETE /api/workouts/:id */
export async function deleteWorkout(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    await queryOne('DELETE FROM workouts WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete workout error:', err);
    res.status(500).json({ error: 'Failed to delete workout.' });
  }
}
