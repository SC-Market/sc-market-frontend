import type { UserProfileState } from "../../hooks/login/UserProfile"

const PROFILE_CACHE_KEY = "cached_user_profile"

export function saveProfileCache(profile: UserProfileState): void {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile))
  } catch {}
}

export function loadProfileCache(): UserProfileState | null {
  try {
    const stored = localStorage.getItem(PROFILE_CACHE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function clearProfileCache(): void {
  try {
    localStorage.removeItem(PROFILE_CACHE_KEY)
  } catch {}
}
