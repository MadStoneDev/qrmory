// lib/admin.ts
// Admin access control via environment variable

/**
 * Check if a user ID is in the admin list.
 * Admin user IDs are stored in the ADMIN_USER_IDS env var as a comma-separated list.
 */
export function isAdmin(userId: string): boolean {
  const adminIds = process.env.ADMIN_USER_IDS?.split(",").map((id) => id.trim()) || [];
  return adminIds.includes(userId);
}
