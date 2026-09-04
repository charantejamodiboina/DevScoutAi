const API_URL = "http://127.0.0.1:8000";

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
  };
}

async function authRequest<T>(
  endpoint: string,
  data: RegisterRequest | LoginRequest
): Promise<T> {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.detail || "Authentication failed"
    );
  }

  return result;
}

export const authService = {
  register(
    data: RegisterRequest
  ): Promise<AuthResponse> {
    return authRequest(
      "/auth/register",
      data
    );
  },

  login(
    data: LoginRequest
  ): Promise<AuthResponse> {
    return authRequest(
      "/auth/login",
      data
    );
  },
};