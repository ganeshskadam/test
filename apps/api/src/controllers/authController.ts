import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken, sanitizeUser } from '../utils/helpers';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

/**
 * POST /api/auth/register
 * Register a new user. Defaults to CLIENT role.
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name, role } = req.body as {
      email: string;
      password: string;
      name: string;
      role?: string;
    };

    if (!email || !password || !name) {
      res.status(400).json({ error: 'email, password, and name are required' });
      return;
    }

    // Prevent self-assignment of privileged roles
    const allowedRoles = ['CLIENT', 'WORKER'];
    const assignedRole = role && allowedRoles.includes(role) ? role : 'CLIENT';

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: assignedRole as 'CLIENT' | 'WORKER',
        // Create the appropriate profile automatically
        ...(assignedRole === 'CLIENT' && {
          clientProfile: { create: { freeProjectsUsed: 0, freeProjectsLimit: 3 } },
        }),
        ...(assignedRole === 'WORKER' && {
          workerProfile: { create: {} },
        }),
      },
      include: {
        clientProfile: true,
        workerProfile: true,
      },
    });

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
}

/**
 * POST /api/auth/login
 * Authenticate with email and password, returns a JWT.
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        clientProfile: true,
        workerProfile: true,
        managementProfile: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: 'Account is disabled' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    res.json({
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

/**
 * GET /api/auth/me
 * Return the authenticated user's profile.
 */
export async function getMe(req: Request & { user?: { userId: string } }, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clientProfile: true,
        workerProfile: true,
        managementProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
}
