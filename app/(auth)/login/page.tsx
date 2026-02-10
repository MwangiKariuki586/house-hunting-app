// Login page for VerifiedNyumba
"use client";

import * as React from "react";
import { startTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { loginAction, type LoginState } from "@/app/actions/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [state, formAction, isPending] = React.useActionState(loginAction, {} as LoginState);
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  // Handle redirect on successful login
  React.useEffect(() => {
    if (state.success && state.redirectTo) {
      setIsRedirecting(true);
      router.refresh();
      router.push(state.redirectTo);
    }
  }, [state.success, state.redirectTo, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <CardContent className="space-y-4">
          {state.error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={state.fieldErrors?.email?.[0]}
            />
          </div>

          <div className="relative space-y-2">
            <Input
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={state.fieldErrors?.password?.[0]}
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-teal-600 hover:text-teal-700"
            >
              Forgot password?
            </Link>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full gap-2 cursor-pointer"
            isLoading={isPending || isRedirecting}
            disabled={isPending || isRedirecting}
          >
            {!isPending && !isRedirecting && <LogIn className="h-4 w-4" />}
            {isRedirecting ? "Redirecting..." : isPending ? "Signing in..." : "Sign in"}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-teal-600 hover:text-teal-700"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={
      <Card className="w-full max-w-md animate-pulse">
        <CardHeader className="h-24 bg-gray-100 rounded-t-xl" />
        <CardContent className="h-64 bg-gray-50" />
      </Card>
    }>
      <LoginForm />
    </React.Suspense>
  );
}



