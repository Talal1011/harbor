import { useSyncExternalStore } from "react";
import { getJson } from "@/lib/account/client";
import {
  applyServerUser,
  currentAuthor,
  subscribeAuthor,
  type Author,
  type RawUser,
} from "@/lib/theme-auth";

export const EXPERIMENTAL_ACCESS_BADGES = ["tester", "moderator", "admin", "dev"] as const;

const ALLOWED_BADGES = new Set<string>(EXPERIMENTAL_ACCESS_BADGES);

export type ExperimentalAccessVerification =
  | "allowed"
  | "denied"
  | "unauthenticated"
  | "unavailable";

export function hasExperimentalAccess(author: Pick<Author, "badges"> | null | undefined): boolean {
  return (
    author?.badges?.some(
      (badge) =>
        typeof badge?.name === "string" && ALLOWED_BADGES.has(badge.name.trim().toLowerCase()),
    ) === true
  );
}

export function currentExperimentalAccess(): boolean {
  return hasExperimentalAccess(currentAuthor());
}

export function subscribeExperimentalAccess(onChange: () => void): () => void {
  return subscribeAuthor(onChange);
}

export function useExperimentalAccess(): boolean {
  return useSyncExternalStore(subscribeExperimentalAccess, currentExperimentalAccess, () => false);
}

export async function verifyExperimentalAccess(): Promise<ExperimentalAccessVerification> {
  if (!currentAuthor()) return "unauthenticated";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await getJson<{ user?: RawUser }>("/identity/api/me", {
      bearer: true,
      signal: controller.signal,
    });
    if (!response?.user || !Array.isArray(response.user.badges)) return "unavailable";
    applyServerUser(response.user);
    return hasExperimentalAccess(response.user) ? "allowed" : "denied";
  } catch (error) {
    // Rejected credentials must never fall back to cached account badges.
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      (error.status === 401 || error.status === 403)
    )
      return error.status === 401 ? "unauthenticated" : "denied";
    return "unavailable";
  } finally {
    clearTimeout(timer);
  }
}
