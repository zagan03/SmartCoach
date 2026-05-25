import { Request, Response } from 'express';
import { queryOne } from '../db';
import { ProfileRow, UserProfile } from '../models/types';

/** GET /api/profile/:userId */
export async function getProfile(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;

  try {
    const row = await queryOne<ProfileRow>(
      'SELECT * FROM profiles WHERE user_id = $1',
      [userId]
    );

    if (!row) {
      res.status(404).json({ error: 'Profile not found.' });
      return;
    }

    // Convert snake_case DB row → camelCase frontend shape
    const profile: UserProfile = {
      name: row.name,
      gender: row.gender,
      weight: Number(row.weight),
      height: Number(row.height),
      age: row.age,
      activityLevel: row.activity_level,
      goal: row.goal,
      targetWeight: Number(row.target_weight),
      createdAt: row.created_at,
    };

    res.json(profile);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
}

/** PUT /api/profile/:userId */
export async function upsertProfile(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;
  const body = req.body as Partial<UserProfile>;

  // Validate required fields
  const required: (keyof UserProfile)[] = ['name', 'gender', 'weight', 'height', 'age', 'activityLevel', 'goal', 'targetWeight'];
  for (const field of required) {
    if (body[field] === undefined || body[field] === null) {
      res.status(400).json({ error: `Missing required field: ${field}` });
      return;
    }
  }

  const { name, gender, weight, height, age, activityLevel, goal, targetWeight } = body as UserProfile;

  try {
    await queryOne(
      `INSERT INTO profiles (user_id, name, gender, weight, height, age, activity_level, goal, target_weight)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id) DO UPDATE SET
         name          = EXCLUDED.name,
         gender        = EXCLUDED.gender,
         weight        = EXCLUDED.weight,
         height        = EXCLUDED.height,
         age           = EXCLUDED.age,
         activity_level = EXCLUDED.activity_level,
         goal          = EXCLUDED.goal,
         target_weight = EXCLUDED.target_weight`,
      [userId, name, gender, weight, height, age, activityLevel, goal, targetWeight]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Upsert profile error:', err);
    res.status(500).json({ error: 'Failed to save profile.' });
  }
}
