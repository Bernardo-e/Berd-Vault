export const LIVE_USER_CLIENT_ID_KEY = "nv_live_client_id";
export const LIVE_USER_COUNT_EVENT = "nv_live_user_count";
export const LIVE_USER_HEARTBEAT_MS = 20_000;
export const LIVE_USER_REFRESH_MS = 15_000;

function createClientId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getLiveUserClientId() {
  if (typeof window === "undefined") return "";

  try {
    const existingClientId = window.localStorage.getItem(LIVE_USER_CLIENT_ID_KEY);
    if (existingClientId) return existingClientId;

    const clientId = createClientId();
    window.localStorage.setItem(LIVE_USER_CLIENT_ID_KEY, clientId);
    return clientId;
  } catch {
    return createClientId();
  }
}
