const baseApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${baseApiUrl.replace(/\/+$/, "")}/api`;

type Json = Record<string, any>;

async function request<T>(path: string, options?: RequestInit & { accessToken?: string; timeoutMs?: number }) {
  const url = `${API_URL}${path}`;
  const headers = new Headers(options?.headers);

  if (options?.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  const timeoutMs = options?.timeoutMs ?? 8000;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // refresh token cookie
    signal: controller.signal,
  });

  window.clearTimeout(timeoutId);

  const contentType = res.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? (await res.json()) : null;

  if (!res.ok) {
    const message = body?.error || body?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return body as T;
}

export const api = {
  get: <T>(path: string, accessToken?: string) =>
    request<T>(path, { method: "GET", accessToken }),
  post: <T>(path: string, json?: Json, accessToken?: string) =>
    request<T>(path, {
      method: "POST",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: json ? JSON.stringify(json) : undefined,
    }),
};

