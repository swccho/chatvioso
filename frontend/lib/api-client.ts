const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://chatvioso.test";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("chatvioso_token");
}

function setToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("chatvioso_token", token);
  } else {
    localStorage.removeItem("chatvioso_token");
  }
}

export { getToken, setToken };

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      setToken(null);
    }
    const message = (data as { message?: string }).message ?? "Request failed";
    const err = new Error(message) as Error & {
      status: number;
      errors?: Record<string, string[]>;
    };
    err.status = res.status;
    err.errors = (data as { errors?: Record<string, string[]> }).errors;
    throw err;
  }

  return data as T;
}
