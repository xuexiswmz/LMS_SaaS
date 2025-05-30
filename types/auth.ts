// Auth配置类型
export type User = {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    [key: string]: string | undefined;
  };
  app_metadata?: {
    provider?: string;
    [key: string]: string | undefined;
  };
  created_at?: string;
  updated_at?: string;
  last_sign_in_at?: string;
  is_anonymous?: boolean;
} | null;

// 扩展的会话用户类型
export type SessionUser = User & {
  role?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  phone_confirmed_at?: string;
  email_confirmed_at?: string;
  factors?: MultiFactorAuthFactor[];
  identities?: UserIdentity[];
};

// 多因素认证因子类型
export type MultiFactorAuthFactor = {
  id: string;
  friendly_name?: string;
  factor_type: "totp" | "webauthn" | "phone" | string;
  status: "verified" | "unverified";
  created_at: string;
  updated_at: string;
};

// 用户身份类型（第三方）
export type UserIdentity = {
  id: string;
  user_id: string;
  identity_data: {
    email?: string;
    sub?: string;
    [key: string]: string | undefined;
  };
  provider: "github" | "google" | string;
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
};
// 登录凭证类型
export type AuthCredentials = {
  email?: string;
  password?: string;
  phone?: string;
  token?: string;
  provider?: "github" | "google";
};
