'use client'
import { z } from "zod";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {supabase} from "@/lib/supabase";
import {AuthError} from "@/types/session";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import { Input } from "./ui/input";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import Image from "next/image";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .optional(),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {

  const [loginMethod,setLoginMethod] = useState<"otp"|'password'>("otp")
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues:{
      email:"",
      password:"",
    }
  })

  const handleOtpLogin = async ({email}:LoginFormValues)=>{
    setIsLoading(true);
    try {
      const {error} = await supabase.auth.signInWithOtp({
        email,
        options:{
          shouldCreateUser:true,
          emailRedirectTo:`${window.location.origin}/auth/callback`
        }
      })
      if(error) throw error;
      setIsOtpSent(true);
      toast.success('OTP has been sent to your email')
    }catch (error) {
      toast.error((error as AuthError).message|| "Failed to send OTP")
    }finally {
      setIsLoading(false);
    }
  }

  const handlePasswordLogin = async({email,password}:LoginFormValues)=>{
   if (!password) return;
    setIsLoading(true);
    try {
      // 1. 尝试登录
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!loginError) {
        toast.success("Logged in successfully");
        window.location.href = '/';
        return;
      }

      // 2. 如果是无效凭证错误，尝试注册
      if (loginError.message === "Invalid login credentials") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (signUpError) {
          if (signUpError.message.includes("already registered")) {
            toast.error("Email already registered. Please sign in.");
          } else {
            throw signUpError;
          }
        } else {
          toast.success("Account created! Please check your email for verification");
        }
        return;
      }

      throw loginError;
    } catch (error) {
      toast.error((error as AuthError).message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  const handleOAuthLogin = async (provider:'github'|'google')=>{
    setIsLoading(true);
    try {
      const {error} = await supabase.auth.signInWithOAuth({
        provider,
        options:{
          redirectTo:`${window.location.origin}/auth/callback`
        }
      })
      if(error) throw error;
    }catch (error) {
      toast.error((error as AuthError).message|| "OAuth login failed")
    }finally {
      setIsLoading(false);
    }
  }

  const onSubmit = (values:LoginFormValues) => {
    if (loginMethod==="otp") {
      return handleOtpLogin(values);
    }
    return handlePasswordLogin(values);
  }

  return (
      <div className='grid gap-6'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
                control={form.control}
                name="email"
                render={({field,fieldState})=>(
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                      <Input
                        placeholder='name@example.com'
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
                )} />
            {loginMethod==="password" && (
              <FormField
                control={form.control}
                name="password"
                render={({field,fieldState})=>(
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                      <Input
                        placeholder='*****'
                        {...field}
                        type="password"
                        disabled={isLoading}
                      />
                      </FormControl>
                      {fieldState.error && (
                          <FormMessage>{fieldState.error.message}</FormMessage>
                      )}
                    </FormItem>
                )} />
            )}
            {isOtpSent && (
            <div className='text-green-600 text-sm'>
              OTP has been sent to your email
            </div>
            )}

            <div className='flex flex-col gap-2'>
              <Button type='submit' disabled={isLoading}>
                { isLoading ?
                    <Image src='/icons/spinner.svg' alt='spinner' width='20' height='20' className=' animate-spin' />
                    : loginMethod==="otp" ? ("Send OTP") : ("Login")}
              </Button>
              <Button type='button' variant='link' className='text-sm'
              onClick={()=>{
                setLoginMethod(loginMethod==="otp" ? "password" : "otp")
                setIsOtpSent(false)
              }}
              >
                {loginMethod==="otp" ? ("Use password instead") : ("Use OTP instead")}
              </Button>
            </div>
          </form>
        </Form>

        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t'/>
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
 Or continue with
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button variant='outline' onClick={()=>handleOAuthLogin('github')} disabled={isLoading}>
            {isLoading?
                <Image src='/icons/spinner.svg' alt='spinner' width={20} height={20} className=' animate-spin' />
                : <Image src='/icons/github.svg' alt='github' width={20} height={20}  />}
            Github
          </Button>
          <Button variant='outline' onClick={()=>handleOAuthLogin('google')} disabled={isLoading}>
            {isLoading?
                <Image src='/icons/spinner.svg' alt='spinner' width={20} height={20} className=' animate-spin' />
                : <Image src='/icons/google.svg' alt='google' width={20} height={20} className='w-auto'/>}
            Google
          </Button>
        </div>
      </div>
  );
};

export default LoginForm;
