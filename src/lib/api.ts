import { useAuthStore } from "../store/useAuthStore";

// In development the API runs locally. A production build only offers accounts
// when VITE_API_URL is set; otherwise the app works in guest mode only.
export const API_URL: string | null =
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:3000" : null);

export class ApiError extends Error {
  status: number;
  /** Per-field messages from the API's validation, e.g. { password: ["..."] }. */
  issues?: Record<string, string[]>;

  constructor(status: number, message: string, issues?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.issues = issues;
  }
}

/** Calls the API with the saved token. A 401 on a signed-in call means the session expired. */
export async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (!API_URL) throw new ApiError(0, "Accounts aren't available");
  const { token } = useAuthStore.getState();

  let res: Response;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers: {
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) useAuthStore.getState().expire();
    throw new ApiError(res.status, data.error ?? "Something went wrong", data.issues);
  }
  return data as T;
}
