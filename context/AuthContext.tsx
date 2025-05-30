// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContextType, AuthError, Session } from "@/types/session";
import { AuthCredentials, SessionUser, User } from "@/types/auth";
import { supabase } from "@/lib/supabase";

export const AuthContext = createContext<AuthContextType>(null!);

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时检查现有会话
  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error.message);
        setIsLoading(false);
        return;
      }

      if (session) {
        setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          token_type: "bearer",
          expires_in: session.expires_in,
          expires_at: session.expires_at,
          user: transformUser(session.user),
        });
        setUser(transformUser(session.user));
      }
      setIsLoading(false);
    };

    getInitialSession();

    // 监听认证状态变化
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (newSession) {
          const transformedUser = transformUser(newSession.user);
          setSession({
            access_token: newSession.access_token,
            refresh_token: newSession.refresh_token,
            token_type: "bearer",
            expires_in: newSession.expires_in,
            expires_at: newSession.expires_at,
            user: transformedUser,
          });
          setUser(transformedUser);
        } else {
          setSession(null);
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 转换用户对象格式
  const transformUser = (userData: any): SessionUser => {
    return {
      ...userData,
      role: userData.role || userData.app_metadata?.role,
      emailVerified: userData.email_confirmed_at !== null,
      phoneVerified: userData.phone_confirmed_at !== null,
      factors: userData.factors || [],
      identities: userData.identities || [],
    };
  };

  // 登录方法
  const signIn = async (credentials: AuthCredentials) => {
    setIsLoading(true);
    const result: {
      error: AuthError;
      session: Session | null;
      user: User | null;
    } = {
      error: null,
      session: null,
      user: null,
    };

    try {
      let authResponse;

      if (credentials.provider) {
        // 第三方登录
        authResponse = await supabase.auth.signInWithOAuth({
          provider: credentials.provider,
        });
      } else if (credentials.token) {
        // 邮箱验证码登录
        authResponse = await supabase.auth.verifyOtp({
          email: credentials.email,
          token: credentials.token,
          type: "email",
        });
      } else {
        // 邮箱密码登录
        authResponse = await supabase.auth.signInWithPassword({
          email: credentials.email!,
          password: credentials.password!,
        });
      }

      if (authResponse.error) {
        result.error = {
          name: "AuthError",
          message: authResponse.error.message,
          status: authResponse.error.status,
          __isAuthError: true,
        };
      } else {
        if (authResponse.data.session) {
          const transformedUser = transformUser(authResponse.data.user);
          const newSession = {
            ...authResponse.data.session,
            user: transformedUser,
          };
          result.session = newSession;
          result.user = transformedUser;
        }
      }
    } catch (error: unknown) {
      result.error = {
        name: "AuthError",
        message: (error as Error).message || "Unknown authentication error",
        __isAuthError: true,
      };
    } finally {
      setIsLoading(false);
    }

    return result;
  };

  // 登出方法
  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      return { error: error ? new Error(error.message) : null };
    } catch (error: unknown) {
      // 将 unknown 类型的错误转换为 Error 类型
      const err = error instanceof Error ? error : new Error(String(error));
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // 刷新会话
  const refreshSession = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) throw error;

      if (data.session) {
        const transformedUser = transformUser(data.user);
        setSession({
          ...data.session,
          user: transformedUser,
        });
        setUser(transformedUser);
      }
    } catch (error) {
      console.error("Refresh session error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    signIn,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
