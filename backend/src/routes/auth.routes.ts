import { Router } from 'express';
import { demoLogin } from '../controllers/auth.controller';

export const authRouter = Router();

/**
 * POST /api/auth/demo-login
 * Authenticates a user with email + password.
 * Returns a simple user object (demo auth — no JWT for simplicity).
 */
authRouter.post('/demo-login', demoLogin);
