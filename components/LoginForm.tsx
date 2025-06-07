"use client";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";
import { EmailForm } from "@/components/login/EmailForm";
import { PasswordForm } from "@/components/login/PasswordForm";
import { OTPForm } from "@/components/login/OTPForm";
import { OAuthButtons } from "@/components/login/OAuthButtons";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .optional()
    .or(z.literal("")),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [loginMethod, setLoginMethod] = useState<"otp" | "password">("otp");
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);

  const [otpCode, setOtpCode] = useState("");
  const [canResend, setCanResend] = useState(true);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleOtpLogin = async ({ email }: LoginFormValues) => {
    if (!canResend) return;
    console.log("Sending OTP to:", email);
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast(error.message || "Failed to send verification code");
    } else {
      setIsOtpSent(true);
      setCanResend(false);
      toast("Verification code has been sent to your email");
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async (email: string, token: string) => {
    setIsLoading(true);
    const { error, data } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) {
      toast(error.message || "Failed to verify code");
    } else {
      console.log("Verifying OTP:", token);
      if (data.session) {
        toast("Logged in successfully");
        window.location.href = "/";
      }
    }
    setIsLoading(false);
  };

  const handlePasswordLogin = async ({ email, password }: LoginFormValues) => {
    if (!password) return;
    setIsLoading(true);
    // 1. 尝试登录
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError) {
      toast(loginError.message || "Login failed");
    } else {
      if (!loginError) {
        toast("Logged in successfully");
        window.location.href = "/";
        return;
      }

      // 2. 如果是无效凭证错误，尝试注册
      if (loginError.message === "Invalid login credentials") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) {
          if (signUpError.message.includes("already registered")) {
            toast("Email already registered. Please sign in.");
          } else {
            throw signUpError;
          }
        } else {
          toast("Account created! Please check your email for verification");
        }
        return;
      }

      throw loginError;
    }
    setIsLoading(false);
  };

  const handleOAuthLogin = async (provider: "github" | "google") => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast(error.message || "OAuth login failed");
    }
    setIsLoading(false);
  };

  const onSubmit = (values: LoginFormValues) => {
    if (loginMethod === "otp") {
      if (isOtpSent && otpCode) {
        return handleVerifyOtp(values.email, otpCode);
      }
      return handleOtpLogin(values);
    }
    return handlePasswordLogin(values);
  };

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              console.log("Enter key pressed");
              form.handleSubmit(onSubmit)();
            }
          }}
        >
          <EmailForm control={form.control} isLoading={isLoading} />
          {loginMethod === "password" && (
            <PasswordForm control={form.control} isLoading={isLoading} />
          )}
          {isOtpSent && (
            <OTPForm
              otpCode={otpCode}
              setOtpCode={setOtpCode}
              isLoading={isLoading}
              canResend={canResend}
              setCanResend={setCanResend}
              handleResend={() => handleOtpLogin(form.getValues())}
            />
          )}

          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              disabled={isLoading || (isOtpSent && !otpCode)}
              onClick={(e) => {
                e.preventDefault();
                form.handleSubmit(onSubmit)();
              }}
            >
              {isLoading ? (
                <Image
                  src="/icons/spinner.svg"
                  alt="spinner"
                  width="20"
                  height="20"
                  className=" animate-spin"
                />
              ) : isOtpSent ? (
                "Verify Code"
              ) : loginMethod === "otp" ? (
                canResend ? (
                  "Send Verification Code"
                ) : (
                  "Sending..."
                )
              ) : (
                "Login"
              )}
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-sm"
              onClick={() => {
                setLoginMethod(loginMethod === "otp" ? "password" : "otp");
                setIsOtpSent(false);
                setOtpCode("");
                setCanResend(true);
              }}
            >
              {loginMethod === "otp"
                ? "Use password instead"
                : "Use OTP instead"}
            </Button>
          </div>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <OAuthButtons isLoading={isLoading} handleOAuthLogin={handleOAuthLogin} />
    </div>
  );
};

export default LoginForm;
