import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to carry the authenticated user payload
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Verify the JWT access token sent in the Authorization header.
 * Attaches the decoded payload to `req.user` on success.
 */
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const secret = process.env.JWT_SECRET ?? 'fallback-secret';

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = decoded as AuthRequest['user'];
    next();
  });
}

/**
 * Role-guard middleware factory.
 * Usage: router.get('/admin', authenticateToken, requireRole(['OWNER']), handler)
 */
export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role,
      });
      return;
    }

    next();
  };
}
