import type { ApiSuccess, AuthResponse, User } from "@/types/api";
import { apiRequest, getToken, setToken } from "./api-client";

export async function register(
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string
): Promise<AuthResponse> {
  const res = await apiRequest<ApiSuccess<AuthResponse>>("/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    }),
  });
  const data = res.data;
  setToken(data.token);
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await apiRequest<ApiSuccess<AuthResponse>>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const data = res.data;
  setToken(data.token);
  return data;
}

export function logout(): void {
  setToken(null);
}

export async function logoutApi(): Promise<void> {
  try {
    await apiRequest("/logout", { method: "POST" });
  } finally {
    setToken(null);
  }
}

export async function fetchCurrentUser(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;
  const res = await apiRequest<ApiSuccess<User>>("/user");
  return res.data;
}

/** Forgot password: request reset link. Wire to backend when endpoint exists. */
export async function forgotPassword(_email: string): Promise<{ message: string }> {
  // TODO: POST /forgot-password when backend adds it
  return { message: "If an account exists for this email, you will receive a reset link." };
}

/** Reset password with token from email. Wire to backend when endpoint exists. */
export async function resetPassword(
  _token: string,
  _password: string,
  _passwordConfirmation: string
): Promise<{ message: string }> {
  // TODO: POST /reset-password when backend adds it
  return { message: "Your password has been reset. You can now sign in." };
}
