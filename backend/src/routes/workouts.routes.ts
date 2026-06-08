import { Router } from 'express';
import {
  getWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
} from '../controllers/workouts.controller';

export const workoutsRouter = Router();

/** GET  /api/workouts/:userId */
workoutsRouter.get('/:userId', getWorkouts);

/** POST /api/workouts */
workoutsRouter.post('/', createWorkout);

/** PUT  /api/workouts/:id */
workoutsRouter.put('/:id', updateWorkout);

/** DELETE /api/workouts/:id */
workoutsRouter.delete('/:id', deleteWorkout);
