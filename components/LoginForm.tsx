"use client";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "./ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import CountdownTimer from "@/components/CountdownTimer";
import { toast } from "sonner";

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
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    {...field}
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                  />
                </FormControl>
                {fieldState.error && (
                  <FormMessage>{fieldState.error.message}</FormMessage>
                )}
              </FormItem>
            )}
          />
          {loginMethod === "password" && (
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="********"
                      {...field}
                      type="password"
                      disabled={isLoading}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage>{fieldState.error.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />
          )}
          {isOtpSent && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 spacy-y-1">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {!canResend ? (
                  <CountdownTimer
                    initialSeconds={60}
                    onComplete={() => setCanResend(true)}
                    className="mt-4 h-10"
                  />
                ) : (
                  <Button
                    variant="outline"
                    disabled={isLoading}
                    onClick={async () => {
                      setCanResend(false);
                      await handleOtpLogin(form.getValues());
                    }}
                    className="mt-4 h-10"
                  >
                    Resend
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code sent to your email address.
              </p>
            </div>
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

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={() => handleOAuthLogin("github")}
          disabled={isLoading}
        >
          {isLoading ? (
            <Image
              src="/icons/spinner.svg"
              alt="spinner"
              width={20}
              height={20}
              className=" animate-spin"
            />
          ) : (
            <Image
              src="/icons/github.svg"
              alt="github"
              width={20}
              height={20}
            />
          )}
          Github
        </Button>
        <Button
          variant="outline"
          onClick={() => handleOAuthLogin("google")}
          disabled={isLoading}
        >
          {isLoading ? (
            <Image
              src="/icons/spinner.svg"
              alt="spinner"
              width={20}
              height={20}
              className=" animate-spin"
            />
          ) : (
            <Image
              src="/icons/google.svg"
              alt="google"
              width={20}
              height={20}
              className="w-auto"
            />
          )}
          Google
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;
