'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const next = searchParams.get('next') || '/';
    const { refreshSession } = useAuth();

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // 处理错误情况
                if (error) {
                    throw new Error(error);
                }

                // 处理OAuth回调
                if (code) {
                    // 使用Supabase客户端API处理会话交换
                    const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);

                    if (authError) {
                        throw authError;
                    }

                    if (data.session) {
                        // 刷新应用中的认证状态
                        await refreshSession();
                    }
                } else {
                    // 对于非OAuth登录，检查用户会话
                    const { data: { user }, error: userError } = await supabase.auth.getUser();

                    if (userError || !user) {
                        throw userError || new Error('User not authenticated');
                    }
                }

                // 登录成功后重定向
                router.replace(next);
            } catch (err) {
                console.error('Authentication callback error:', err);
                router.replace(`/login?error=${encodeURIComponent(err.message || 'Authentication failed')}`);
            }
        };

        handleAuthCallback();
    }, [code, error, next, router, refreshSession]);

    return (
        <div className="container mx-auto flex min-h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="text-lg">Processing authentication...</p>
            </div>
        </div>
    );
}