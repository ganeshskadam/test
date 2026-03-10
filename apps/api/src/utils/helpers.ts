import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'fallback-secret';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate a signed JWT for the given user payload.
 */
export function generateToken(payload: {
  userId: string;
  email: string;
  role: string;
}): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Remove the password field from a user object before sending it to the client.
 */
export function sanitizeUser<T extends { password?: string }>(
  user: T
): Omit<T, 'password'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _pw, ...safe } = user;
  return safe;
}

/**
 * Compute the next available queue position for approved projects.
 * Pass the current highest queue position; returns that value + 1.
 */
export function nextQueuePosition(currentMax: number | null): number {
  return (currentMax ?? 0) + 1;
}

/**
 * Calculate an estimated start date based on queue position.
 * Assumes each project takes ~1 week on average.
 */
export function estimateStartDate(queuePosition: number): Date {
  const weeksAhead = queuePosition - 1; // position 1 = start immediately
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + weeksAhead * 7);
  return startDate;
}
