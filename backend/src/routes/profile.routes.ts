import { Router } from 'express';
import { getProfile, upsertProfile } from '../controllers/profile.controller';

export const profileRouter = Router();

/** GET /api/profile/:userId */
profileRouter.get('/:userId', getProfile);

/** PUT /api/profile/:userId */
profileRouter.put('/:userId', upsertProfile);
