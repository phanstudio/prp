// src/utilities/postCreateAction.ts

const STORAGE_KEY = "prp_post_create_action";
const KEEP_IMAGE_KEY = "prp_keep_image_on_create";
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type PostCreateAction = "gallery" | "continue";

export interface StoredPreference {
  action: PostCreateAction;
  expiresAt: number;
}

export function getPostCreatePreference(): PostCreateAction | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: StoredPreference = JSON.parse(raw);
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.action;
  } catch {
    return null;
  }
}

export function getPostCreatePreferenceDetails(): {
  action: PostCreateAction;
  expiresAt: number;
  daysRemaining: number;
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: StoredPreference = JSON.parse(raw);
    const now = Date.now();
    if (now > parsed.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    const msRemaining = parsed.expiresAt - now;
    const daysRemaining = Math.max(1, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));
    return {
      action: parsed.action,
      expiresAt: parsed.expiresAt,
      daysRemaining,
    };
  } catch {
    return null;
  }
}

export function setPostCreatePreference(action: PostCreateAction, remember: boolean): void {
  try {
    if (remember) {
      const payload: StoredPreference = {
        action,
        expiresAt: Date.now() + ONE_WEEK_MS,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.warn("Failed to save post-create preference:", e);
  }
}

export function clearPostCreatePreference(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Failed to clear post-create preference:", e);
  }
}

/**
 * Preference for keeping or clearing the base background image
 * when clicking "Create Another" or resetting canvas.
 * Default is false (reset everything including image).
 */
export function getKeepImagePreference(): boolean {
  try {
    const val = localStorage.getItem(KEEP_IMAGE_KEY);
    return val === "true";
  } catch {
    return false;
  }
}

export function setKeepImagePreference(keep: boolean): void {
  try {
    localStorage.setItem(KEEP_IMAGE_KEY, keep ? "true" : "false");
  } catch (e) {
    console.warn("Failed to save keep image preference:", e);
  }
}
