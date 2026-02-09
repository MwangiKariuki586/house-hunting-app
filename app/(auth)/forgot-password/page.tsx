/**
 * Forgot Password Page
 * 
 * Allows users to request a password reset email.
 * Displays confirmation message on success.
 */
"use client";

import * as React from "react";
import { startTransition } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
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
import { forgotPasswordAction, type ForgotPasswordState } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
    const [email, setEmail] = React.useState("");
    const [state, formAction, isPending] = React.useActionState(
        forgotPasswordAction,
        {} as ForgotPasswordState
    );
    const [showSuccess, setShowSuccess] = React.useState(false);

    // Show success state after form submission
    React.useEffect(() => {
        if (state.success) {
            setShowSuccess(true);
        }
    }, [state.success]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => {
            formAction(formData);
        });
    };

    // Success state - email sent confirmation
    if (showSuccess) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                        <CheckCircle className="h-8 w-8 text-teal-600" />
                    </div>
                    <CardTitle className="text-2xl">Check your email</CardTitle>
                    <CardDescription className="mt-2">
                        If an account exists for <strong className="text-gray-700">{email}</strong>,
                        we&apos;ve sent password reset instructions.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                        <p className="mb-2">
                            <strong>Didn&apos;t receive the email?</strong>
                        </p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Check your spam or junk folder</li>
                            <li>Make sure you entered the correct email</li>
                            <li>Wait a few minutes and try again</li>
                        </ul>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => {
                            setShowSuccess(false);
                            setEmail("");
                        }}
                    >
                        Try a different email
                    </Button>

                    <Link href="/login" className="w-full">
                        <Button variant="default" className="w-full gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to login
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    // Request form
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Forgot password?</CardTitle>
                <CardDescription>
                    Enter your email and we&apos;ll send you a reset link
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
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
                            autoComplete="email"
                            autoFocus
                        />
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <Button
                        type="submit"
                        className="w-full gap-2 cursor-pointer"
                        isLoading={isPending}
                        disabled={isPending || !email}
                    >
                        {!isPending && <Mail className="h-4 w-4" />}
                        {isPending ? "Sending..." : "Send reset link"}
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
