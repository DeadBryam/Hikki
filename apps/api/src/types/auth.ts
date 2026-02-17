export interface User {
  created_at: string | null;
  deleted_at: string | null;
  email: string | null;
  id: string;
  name: string | null;
  onboarding_completed_at: string | null;
  password: string | null;
  updated_at: string | null;
  username: string;
  validated_at: string | null;
}

export interface UserWithoutPassword {
  deleted_at: string | null;
  email: string | null;
  id: string;
  name: string | null;
  onboarding_completed_at: string | null;
  username: string;
  validated_at: string | null;
}

export interface Session {
  created_at: string;
  expires_at: number;
  id: string;
  ip_address: string | null;
  token: string;
  user_agent: string | null;
  user_id: string;
}

export interface CreateUserParams {
  email: string;
  name?: string;
  password: string;
  username: string;
}

export interface LoginParams {
  password: string;
  username: string;
}

export interface UserResponse {
  email: string | null;
  name: string | null;
  onboarding_completed_at: string | null;
  username: string;
}

export interface SessionWithUser {
  session: Session;
  user: UserWithoutPassword;
}
