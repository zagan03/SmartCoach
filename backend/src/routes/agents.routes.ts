import { Router } from 'express';
import { runWorkoutCoach, runNutritionProgress } from '../controllers/agents.controller';

export const agentsRouter = Router();

/** POST /api/agents/workout-coach */
agentsRouter.post('/workout-coach', runWorkoutCoach);

/** POST /api/agents/nutrition-progress */
agentsRouter.post('/nutrition-progress', runNutritionProgress);
