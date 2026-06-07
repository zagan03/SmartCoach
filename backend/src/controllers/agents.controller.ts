import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, query } from '../db';
import { ProfileRow, ProgressRow, WorkoutRow, UserProfile } from '../models/types';
import { generateWorkoutRecommendation } from '../services/workout-agent.service';
import { generateNutritionRecommendation } from '../services/nutrition-agent.service';

/** POST /api/agents/workout-coach */
export async function runWorkoutCoach(req: Request, res: Response): Promise<void> {
  const { userId, equipment, constraints } = req.body as {
    userId: string;
    equipment?: string;
    constraints?: string;
  };

  if (!userId) {
    res.status(400).json({ error: 'userId is required.' });
    return;
  }

  // Guardrail: userId must be non-empty string
  if (typeof userId !== 'string' || userId.trim().length === 0) {
    res.status(400).json({ error: 'Invalid userId.' });
    return;
  }

  try {
    // Fetch profile
    const profileRow = await queryOne<ProfileRow>(
      'SELECT * FROM profiles WHERE user_id = $1',
      [userId]
    );

    if (!profileRow) {
      res.status(404).json({ error: 'User profile not found. Please create a profile first.' });
      return;
    }

    const profile: UserProfile = {
      name: profileRow.name,
      gender: profileRow.gender,
      weight: Number(profileRow.weight),
      height: Number(profileRow.height),
      age: profileRow.age,
      activityLevel: profileRow.activity_level,
      goal: profileRow.goal,
      targetWeight: Number(profileRow.target_weight),
      createdAt: profileRow.created_at,
    };

    // Fetch recent workouts
    const recentWorkouts = await query<WorkoutRow>(
      'SELECT * FROM workouts WHERE user_id = $1 ORDER BY date DESC LIMIT 10',
      [userId]
    );

    // Generate recommendation
    const recommendation = await generateWorkoutRecommendation(
      profile,
      recentWorkouts,
      equipment,
      constraints
    );

    // Log to agent_logs
    const logId = uuidv4();
    await queryOne(
      `INSERT INTO agent_logs (id, user_id, agent_type, request, response) VALUES ($1, $2, $3, $4, $5)`,
      [logId, userId, 'workout-coach', JSON.stringify({ equipment, constraints }), JSON.stringify(recommendation)]
    );

    res.json(recommendation);
  } catch (err) {
    console.error('Workout coach agent error:', err);
    res.status(500).json({ error: 'Workout coach agent failed.' });
  }
}

/** POST /api/agents/nutrition-progress */
export async function runNutritionProgress(req: Request, res: Response): Promise<void> {
  const { userId } = req.body as { userId: string };

  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    res.status(400).json({ error: 'userId is required.' });
    return;
  }

  try {
    // Fetch profile
    const profileRow = await queryOne<ProfileRow>(
      'SELECT * FROM profiles WHERE user_id = $1',
      [userId]
    );

    if (!profileRow) {
      res.status(404).json({ error: 'User profile not found. Please create a profile first.' });
      return;
    }

    const profile: UserProfile = {
      name: profileRow.name,
      gender: profileRow.gender,
      weight: Number(profileRow.weight),
      height: Number(profileRow.height),
      age: profileRow.age,
      activityLevel: profileRow.activity_level,
      goal: profileRow.goal,
      targetWeight: Number(profileRow.target_weight),
      createdAt: profileRow.created_at,
    };

    // Fetch weight history (last 14 days)
    const weightHistory = await query<ProgressRow>(
      `SELECT * FROM progress_entries WHERE user_id = $1
       AND date >= CURRENT_DATE - INTERVAL '14 days'
       ORDER BY date DESC`,
      [userId]
    );

    // Guardrail: need at least some data
    if (weightHistory.length < 1) {
      res.status(400).json({
        error: 'Not enough weight data. Please add at least 1 weight entry before running the nutrition analysis.',
      });
      return;
    }

    // Generate recommendation
    const recommendation = await generateNutritionRecommendation(profile, weightHistory);

    // Log to agent_logs
    const logId = uuidv4();
    await queryOne(
      `INSERT INTO agent_logs (id, user_id, agent_type, request, response) VALUES ($1, $2, $3, $4, $5)`,
      [logId, userId, 'nutrition-progress', JSON.stringify({ weightHistory: weightHistory.length }), JSON.stringify(recommendation)]
    );

    res.json(recommendation);
  } catch (err) {
    console.error('Nutrition agent error:', err);
    res.status(500).json({ error: 'Nutrition agent failed.' });
  }
}
