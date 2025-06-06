// types/database.ts
export type Database = {
    public: {
        Tables: {
            // 根据你的实际数据库表结构定义
            // 示例：
            profiles: {
                Row: {
                    id: string;
                    updated_at: string | null;
                    username: string | null;
                    full_name: string | null;
                    avatar_url: string | null;
                };
                Insert: {
                    id: string;
                    updated_at?: string | null;
                    username?: string | null;
                    full_name?: string | null;
                    avatar_url?: string | null;
                };
                Update: {
                    id?: string;
                    updated_at?: string | null;
                    username?: string | null;
                    full_name?: string | null;
                    avatar_url?: string | null;
                };
            };
        };
    };
};