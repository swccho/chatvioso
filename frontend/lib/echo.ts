"use client";

/**
 * Laravel Echo (Reverb) client for realtime presence/typing.
 * Only connects when NEXT_PUBLIC_REVERB_APP_KEY is set. If unset, no WebSocket is opened
 * (no console errors). When set, ensure Laravel Reverb is running (php artisan reverb:start)
 * and BROADCAST_CONNECTION=reverb in the backend .env.
 */
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { getToken } from "./api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://chatvioso.test";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

if (typeof window !== "undefined") {
  window.Pusher = Pusher;
}

let echoInstance: InstanceType<typeof Echo> | null = null;

export function getEcho(): InstanceType<typeof Echo> | null {
  if (typeof window === "undefined") return null;
  const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY?.trim();
  if (!key) return null;
  const token = getToken();
  if (!token) return null;

  if (!echoInstance) {
    echoInstance = new Echo({
      broadcaster: "reverb",
      key,
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? "localhost",
      wsPort: process.env.NEXT_PUBLIC_REVERB_PORT ? Number(process.env.NEXT_PUBLIC_REVERB_PORT) : 8080,
      wssPort: process.env.NEXT_PUBLIC_REVERB_PORT ? Number(process.env.NEXT_PUBLIC_REVERB_PORT) : 443,
      forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http") === "https",
      enabledTransports: ["ws", "wss"],
      authEndpoint: `${API_URL}/api/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }
  return echoInstance;
}

export function disconnectEcho(): void {
  if (echoInstance) {
    (echoInstance as InstanceType<typeof Echo> & { disconnect?: () => void }).disconnect?.();
    echoInstance = null;
  }
}
