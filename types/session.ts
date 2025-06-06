import { Session, User } from "@supabase/supabase-js";
import {AuthCredentials} from "@/types/auth";

export type SessionUser = User & {
  role?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
};

export type AuthError = {
  name: string;
  message: string;
  status?: number;
  __isAuthError: boolean;
};

export interface AuthContextType {
  user: SessionUser | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (credentials: AuthCredentials) => Promise<{
    error: AuthError | null;
    session: Session | null;
    user: SessionUser | null;
  }>;
  signOut: () => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;
}