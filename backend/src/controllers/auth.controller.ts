import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { queryOne } from '../db';
import { UserRow } from '../models/types';

/**
 * POST /api/auth/demo-login
 *
 * Authenticates against the local PostgreSQL users table.
 * Returns the user id and email on success.
 *
 * This is a simplified demo auth — no JWT, no sessions.
 * The frontend stores the userId in localStorage and sends it with requests.
 * Suitable for local development and demos only.
 */
export async function demoLogin(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  try {
    const user = await queryOne<UserRow>(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Authentication failed.' });
  }
}
