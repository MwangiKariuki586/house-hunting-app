// Registration page for VerifiedNyumba
"use client";

import * as React from "react";
import { startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus, Home, Building2, Loader2 } from "lucide-react";
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
import { cn } from "@/app/lib/utils";
import { registerAction, type RegisterState } from "@/app/actions/auth";

/**
 * Registration form component
 */
function RegisterForm() {
  const router = useRouter();
  
  // Get default role from URL params on client side
  const [defaultRole, setDefaultRole] = React.useState<"TENANT" | "LANDLORD">("TENANT");
  
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const role = params.get("role");
    if (role === "LANDLORD") {
      setDefaultRole("LANDLORD");
    }
  }, []);

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<"TENANT" | "LANDLORD">(defaultRole);
  
  // Update selectedRole when defaultRole changes
  React.useEffect(() => {
    setSelectedRole(defaultRole);
  }, [defaultRole]);
  
  // Form field states
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");

  const [state, formAction, isPending] = React.useActionState(registerAction, {} as RegisterState);
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  // Handle redirect on successful registration
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
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>
          Join VerifiedNyumba and find your dream home
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {state.error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {state.error}
            </div>
          )}

          {/* Hidden role input for form submission */}
          <input type="hidden" name="role" value={selectedRole} />

          {/* Role Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              I want to
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole("TENANT")}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors",
                  selectedRole === "TENANT"
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <Home className="h-6 w-6" />
                <span className="text-sm font-medium">Find a home</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("LANDLORD")}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors",
                  selectedRole === "LANDLORD"
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <Building2 className="h-6 w-6" />
                <span className="text-sm font-medium">List property</span>
              </button>
            </div>
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="firstName"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={state.fieldErrors?.firstName?.[0]}
            />
            <Input
              label="Last Name"
              name="lastName"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={state.fieldErrors?.lastName?.[0]}
            />
          </div>

          {/* Contact fields */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={state.fieldErrors?.email?.[0]}
            />
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="0712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={state.fieldErrors?.phone?.[0]}
            />
          </div>

          {/* Password fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label 
                htmlFor="password" 
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={state.fieldErrors?.password?.[0]}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <label 
                htmlFor="confirmPassword" 
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={state.fieldErrors?.confirmPassword?.[0]}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-teal-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-teal-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full gap-2 cursor-pointer"
            isLoading={isPending || isRedirecting}
            disabled={isPending || isRedirecting}
          >
            {!isPending && !isRedirecting && <UserPlus className="h-4 w-4" />}
            {isRedirecting ? "Redirecting..." : isPending ? "Creating account..." : "Create account"}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-teal-600 hover:text-teal-700"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

/**
 * Main register page component
 */
export default function RegisterPage() {
  return <RegisterForm />;
}
