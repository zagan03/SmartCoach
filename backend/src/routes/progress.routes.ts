import { Router } from 'express';
import {
  getProgress,
  addProgress,
  updateProgress,
  deleteProgress,
} from '../controllers/progress.controller';

export const progressRouter = Router();

/** GET    /api/progress/:userId */
progressRouter.get('/:userId', getProgress);

/** POST   /api/progress */
progressRouter.post('/', addProgress);

/** PATCH  /api/progress/:id */
progressRouter.patch('/:id', updateProgress);

/** DELETE /api/progress/:id */
progressRouter.delete('/:id', deleteProgress);
