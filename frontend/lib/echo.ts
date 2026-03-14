"use client";

/**
 * Laravel Echo (Reverb) client for realtime presence/typing.
 * Requires the Laravel Reverb server to be running (php artisan reverb:start)
 * and BROADCAST_CONNECTION=reverb in the backend .env. If Reverb is not running,
 * you will see WebSocket connection errors in the console; the rest of the app still works.
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
  const token = getToken();
  if (!token) return null;

  if (!echoInstance) {
    echoInstance = new Echo({
      broadcaster: "reverb",
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? "",
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
