import crypto from 'crypto';

// Shared session storage for admin authentication
export const ADMIN_SESSIONS = new Map<string, { email: string; expiresAt: number }>();

// Mock admin data - In production, this should come from a database
export const ADMIN_USERS = [
  {
    id: 1,
    email: 'admin@seshadripuram.edu',
    password: crypto
      .pbkdf2Sync('admin123', 'admin-salt-speak2campus', 1000, 64, 'sha512')
      .toString('hex'),
    name: 'Admin User',
  },
];

// Hash password using crypto
export function hashPassword(password: string): string {
  return crypto
    .pbkdf2Sync(password, 'admin-salt-speak2campus', 1000, 64, 'sha512')
    .toString('hex');
}

// Verify password
export function verifyPassword(password: string, hash: string): boolean {
  const passwordHash = hashPassword(password);
  return passwordHash === hash;
}

// Generate a secure session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Validate admin session
export async function validateAdminSession(token: string): Promise<boolean> {
  if (!token) return false;
  
  try {
    const response = await fetch('/api/admin/validate-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
}

// Get admin user from token
export async function getAdminUser(token: string) {
  if (!token) return null;
  
  try {
    const response = await fetch('/api/admin/user', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching admin user:', error);
    return null;
  }
}
