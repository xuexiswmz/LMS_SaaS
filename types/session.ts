import { SessionUser, User, AuthCredentials } from "./auth";

//基础session类型
export type Session = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at?: number;
  user: SessionUser;
} | null;

//Auth上下文类型
export type AuthContextType = {
  user: SessionUser | null;
  session: Session;
  isLoading: boolean;
  signIn: (credentials: AuthCredentials) => Promise<{
    error: AuthError | null;
    session: Session | null;
    user: User | null;
  }>;
  signOut: () => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;
};

//Auth错误类型
export type AuthError = {
  name: string;
  message: string;
  status?: number;
  __isAuthError?: boolean;
} | null;
