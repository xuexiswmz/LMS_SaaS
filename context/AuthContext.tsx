"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContextType, AuthError } from "@/types/session";
import { AuthCredentials } from "@/types/auth";
import { supabase } from "@/lib/supabase";
import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

// 定义与 Supabase 兼容的 SessionUser 类型
type SessionUser = User & {
  role?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  factors?: any[];
  identities?: any[];
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => ({ error: null, session: null, user: null }),
  signOut: async () => ({ error: null }),
  refreshSession: async () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 转换用户对象格式
  const transformUser = (userData: User): SessionUser => {
    return {
      ...userData,
      role: userData.role || userData.app_metadata?.role,
      emailVerified: !!userData.email_confirmed_at,
      phoneVerified: !!userData.phone_confirmed_at,
      factors: userData.factors || [],
      identities: userData.identities || [],
    };
  };

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

      if (session && session.user) {
        const transformedUser = transformUser(session.user);
        setSession(session);
        setUser(transformedUser);
      }
      setIsLoading(false);
    };

    getInitialSession();

    // 监听认证状态变化
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        console.log("Auth state changed:", event);

        if (
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {
          if (newSession && newSession.user) {
            const transformedUser = transformUser(newSession.user);
            setSession(newSession);
            setUser(transformedUser);
          }
        } else if (event === "SIGNED_OUT") {
          setSession(null);
          setUser(null);
        } else {
          console.log("Other auth event:", event);
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 登录方法
  const signIn = async (credentials: AuthCredentials) => {
    setIsLoading(true);
    const result: {
      error: AuthError | null;
      session: Session | null;
      user: SessionUser | null;
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
      } else if (authResponse.data?.session) {
        const transformedUser = transformUser(authResponse.data.user);
        result.session = authResponse.data.session;
        result.user = transformedUser;
      }
    } catch (error: unknown) {
      const err = error as Error;
      result.error = {
        name: "AuthError",
        message: err.message || "Unknown authentication error",
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
      const err = error instanceof Error ? error : new Error(String(error));
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // 刷新会话
  const refreshSession = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      console.error("Refresh session error:", error);
    } else {
      if (data.session && data.session.user) {
        const transformedUser = transformUser(data.session.user);
        setSession(data.session);
        setUser(transformedUser);
      }
    }
    setIsLoading(false);
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
