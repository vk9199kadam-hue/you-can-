import type { UserProfile } from "../types";

/**
 * When true, AuthContext seeds a mock user (local UI only).
 * Set VITE_AUTH_BYPASS=true in .env for local dev; omit or false for real Firebase auth.
 */
export const IS_AUTH_BYPASS = import.meta.env.VITE_AUTH_BYPASS === "true";

export const MOCK_USER_PROFILE: UserProfile = {
  uid: "mock-admin-id",
  email: "dev@youcan.ai",
  name: "Developer (Bypassed)",
  role: "super_admin",
  academyId: "master-academy",
  academyName: "Master Academy",
  classLevel: "Class 12",
  stream: "PCM",
  status: "active",
  createdAt: new Date(),
};
