/**
 * useSocialAuth — Backward compatibility layer.
 *
 * Better Auth replaces the previous React Query-based social auth flow.
 * This file re-exports the Better Auth client for any existing code that
 * hasn't been migrated yet.
 *
 * Migration guide:
 * - Replace `useSocialLogin()` with `authClient.signIn.social()`
 * - Replace `useLogout()` with `authClient.signOut()`
 */
export { authClient } from "@/lib/auth-client";
