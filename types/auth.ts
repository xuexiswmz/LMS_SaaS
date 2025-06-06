export interface AuthCredentials {
  email?: string;
  password?: string;
  token?: string;
  provider?: 'github' | 'google';
}