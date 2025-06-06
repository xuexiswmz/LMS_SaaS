import LoginForm from "@/components/LoginForm";

function Login() {

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to LMS_SaaS
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Select an option to get started.
          </p>
        </div>
        <LoginForm/>
      </div>
    </div>
  );
}

export default Login;
