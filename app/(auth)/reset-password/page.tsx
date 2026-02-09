/**
 * Reset Password Page
 * 
 * Allows users to set a new password using a reset token.
 * Validates token and shows appropriate error states.
 */
"use client";

import * as React from "react";
import { startTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Key, CheckCircle, AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
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
import { resetPasswordAction, type ResetPasswordState } from "@/app/actions/auth";

/**
 * Loading fallback for the reset password form
 */
function ResetPasswordLoading() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Create new password</CardTitle>
                <CardDescription>Loading...</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </CardContent>
        </Card>
    );
}

/**
 * Inner component that uses useSearchParams
 */
function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [state, formAction, isPending] = React.useActionState(
        resetPasswordAction,
        {} as ResetPasswordState
    );
    const [isRedirecting, setIsRedirecting] = React.useState(false);

    // Handle successful password reset
    React.useEffect(() => {
        if (state.success && state.redirectTo) {
            setIsRedirecting(true);
            // Short delay to show success message
            setTimeout(() => {
                router.push(state.redirectTo!);
            }, 2000);
        }
    }, [state.success, state.redirectTo, router]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.set("token", token || "");
        startTransition(() => {
            formAction(formData);
        });
    };

    // Check for token expiry or invalid token errors
    const isTokenError = state.code === "TOKEN_EXPIRED" || 
                         state.code === "TOKEN_ALREADY_USED" || 
                         state.code === "INVALID_TOKEN";

    // No token provided
    if (!token) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl">Invalid link</CardTitle>
                    <CardDescription>
                        This password reset link is invalid or incomplete.
                    </CardDescription>
                </CardHeader>

                <CardFooter className="flex flex-col gap-4">
                    <Link href="/forgot-password" className="w-full">
                        <Button variant="default" className="w-full">
                            Request a new reset link
                        </Button>
                    </Link>
                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to login
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    // Success state
    if (state.success) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                        <CheckCircle className="h-8 w-8 text-teal-600" />
                    </div>
                    <CardTitle className="text-2xl">Password reset successful!</CardTitle>
                    <CardDescription>
                        Your password has been updated. Redirecting to login...
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="flex justify-center">
                        <div className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Token error state
    if (isTokenError) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                        <AlertTriangle className="h-8 w-8 text-amber-600" />
                    </div>
                    <CardTitle className="text-2xl">
                        {state.code === "TOKEN_EXPIRED" && "Link expired"}
                        {state.code === "TOKEN_ALREADY_USED" && "Link already used"}
                        {state.code === "INVALID_TOKEN" && "Invalid link"}
                    </CardTitle>
                    <CardDescription>
                        {state.error}
                    </CardDescription>
                </CardHeader>

                <CardFooter className="flex flex-col gap-4">
                    <Link href="/forgot-password" className="w-full">
                        <Button variant="default" className="w-full">
                            Request a new reset link
                        </Button>
                    </Link>
                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to login
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    // Reset form
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Create new password</CardTitle>
                <CardDescription>
                    Enter your new password below
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {state.error && !isTokenError && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            {state.error}
                        </div>
                    )}

                    <div className="relative space-y-2">
                        <Input
                            label="New password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={state.fieldErrors?.password?.[0]}
                            autoComplete="new-password"
                            autoFocus
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

                    <div className="relative space-y-2">
                        <Input
                            label="Confirm password"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            error={state.fieldErrors?.confirmPassword?.[0]}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                        <p className="font-medium mb-1">Password must contain:</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                            <li>At least 8 characters</li>
                            <li>One uppercase letter</li>
                            <li>One lowercase letter</li>
                            <li>One number</li>
                        </ul>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <Button
                        type="submit"
                        className="w-full gap-2 cursor-pointer"
                        isLoading={isPending || isRedirecting}
                        disabled={isPending || isRedirecting || !password || !confirmPassword}
                    >
                        {!isPending && !isRedirecting && <Key className="h-4 w-4" />}
                        {isPending ? "Resetting..." : isRedirecting ? "Redirecting..." : "Reset password"}
                    </Button>

                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to login
                    </Link>
                </CardFooter>
            </form>
        </Card>
    );
}

/**
 * Page component with Suspense boundary for useSearchParams
 */
export default function ResetPasswordPage() {
    return (
        <React.Suspense fallback={<ResetPasswordLoading />}>
            <ResetPasswordForm />
        </React.Suspense>
    );
}
