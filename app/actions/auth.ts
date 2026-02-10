"use server";

import { randomBytes } from "crypto";
import prisma from "@/app/lib/prisma";
import {
    comparePassword,
    hashPassword,
    generateAccessToken,
    generateRefreshToken,
    storeRefreshToken,
    setAuthCookies,
    removeAllUserRefreshTokens,
} from "@/app/lib/auth";
import {
    loginSchema,
    registerSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    formatKenyanPhone,
} from "@/app/lib/validations/auth";
import { logger } from "@/app/lib/logger";
import { AuthError, isAuthError, parsePrismaError, type AuthErrorCode } from "@/app/lib/auth-errors";
import { sendPasswordResetEmail } from "@/app/lib/email";

// ============================================================================
// Types
// ============================================================================

export type AuthState = {
    success?: boolean;
    error?: string;
    code?: AuthErrorCode;
    fieldErrors?: Record<string, string[]>;
    redirectTo?: string;
    timestamp?: number;
};

// Re-export for backwards compatibility
export type LoginState = AuthState;
export type RegisterState = AuthState;
export type ForgotPasswordState = AuthState;
export type ResetPasswordState = AuthState;

// ============================================================================
// Login Action
// ============================================================================

/**
 * Server action for user login
 * Validates credentials, generates tokens, and returns redirect path
 */
export async function loginAction(
    prevState: LoginState,
    formData: FormData
): Promise<LoginState> {
    const rawData = Object.fromEntries(formData.entries());
    const email = (rawData.email as string)?.toLowerCase() || "";

    // Validate input
    const validationResult = loginSchema.safeParse(rawData);
    if (!validationResult.success) {
        logger.warn("Login validation failed", {
            action: "LOGIN",
            email,
            errors: validationResult.error.flatten().fieldErrors,
        });
        return {
            error: "Validation failed",
            code: "VALIDATION_ERROR",
            fieldErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
            timestamp: Date.now(),
        };
    }

    const { password } = validationResult.data;
    const callbackUrl = rawData.callbackUrl as string;
    let redirectPath = "/properties";

    // Validate callbackUrl to ensure it's a relative path (security)
    if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
        redirectPath = callbackUrl;
    }

    // Debug: Trace execution start
    logger.info("Login attempt started", { action: "LOGIN_DEBUG", email, callbackUrl });

    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
        logger.error("Missing JWT secrets", undefined, { action: "LOGIN_CONFIG_ERROR" });
        return { error: "Configuration error", code: "INTERNAL_ERROR", timestamp: Date.now() };
    }

    try {
        // Find user by email
        logger.debug("Querying user by email", { action: "LOGIN_DEBUG", email });
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Check if user exists
        if (!user) {
            logger.warn("Login failed: user not found", { action: "LOGIN", email });
            throw new AuthError("USER_NOT_FOUND", `No user found with email: ${email}`, { email });
        }

        // Verify password
        logger.debug("Verifying password", { action: "LOGIN_DEBUG", email, userId: user.id });
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            logger.warn("Login failed: invalid password", {
                action: "LOGIN",
                email,
                userId: user.id,
            });
            throw new AuthError("INVALID_CREDENTIALS", "Password mismatch", {
                email,
                userId: user.id,
            });
        }

        logger.debug("Credentials valid, generating tokens", { action: "LOGIN_DEBUG", userId: user.id });

        // Generate tokens
        const tokenPayload = { userId: user.id, email: user.email, role: user.role };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        logger.debug("Tokens generated, storing refresh token", { action: "LOGIN_DEBUG", userId: user.id });

        // Parallel execution of independent operations
        await Promise.all([
            storeRefreshToken(user.id, refreshToken),
            prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
            }),
            setAuthCookies(accessToken, refreshToken),
        ]);

        logger.info("User logged in successfully", {
            action: "LOGIN",
            userId: user.id,
            role: user.role,
            email,
        });

        // Determine redirect based on role IF no callbackUrl was provided
        if (!callbackUrl) {
            if (user.role === "LANDLORD") redirectPath = "/landlord/listings";
            else if (user.role === "ADMIN") redirectPath = "/admin";
        }

        return {
            success: true,
            redirectTo: redirectPath,
            timestamp: Date.now(),
        };
    } catch (error) {
        // Handle known auth errors
        if (isAuthError(error)) {
            logger.error("Login failed (AuthError)", error, { ...error.context, errorStack: error.stack });
            return error.toClientResponse();
        }

        // Handle unexpected errors
        logger.error("Login unexpected error", error, {
            action: "LOGIN_ERROR",
            email,
            errorName: error instanceof Error ? error.name : 'Unknown',
            errorMessage: error instanceof Error ? error.message : String(error)
        });

        return {
            error: "An unexpected error occurred. Please try again.",
            code: "INTERNAL_ERROR",
            timestamp: Date.now(),
        };
    }
}

// ============================================================================
// Register Action
// ============================================================================

/**
 * Server action for user registration
 * Creates account, generates tokens, and returns redirect path based on role
 */
export async function registerAction(
    prevState: RegisterState,
    formData: FormData
): Promise<RegisterState> {
    const rawData = Object.fromEntries(formData.entries());
    const email = (rawData.email as string)?.toLowerCase() || "";

    // Validate input
    const validationResult = registerSchema.safeParse(rawData);
    if (!validationResult.success) {
        logger.warn("Registration validation failed", {
            action: "REGISTER",
            email,
            errors: validationResult.error.flatten().fieldErrors,
        });
        return {
            error: "Validation failed",
            code: "VALIDATION_ERROR",
            fieldErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
            timestamp: Date.now(),
        };
    }

    const { phone, password, firstName, lastName, role } = validationResult.data;
    let redirectPath = "/properties";

    // Debug: Trace execution start
    logger.info("Registration attempt started", { action: "REGISTER_DEBUG", email, role });

    try {
        // Format phone number to international format
        const formattedPhone = formatKenyanPhone(phone);

        // Check if user already exists
        logger.debug("Checking for existing user", { action: "REGISTER_DEBUG", email });
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { phone: formattedPhone }],
            },
        });

        if (existingUser) {
            const isEmailDuplicate = existingUser.email === email;
            const errorCode = isEmailDuplicate ? "USER_ALREADY_EXISTS" : "PHONE_ALREADY_EXISTS";
            const field = isEmailDuplicate ? "email" : "phone";

            logger.warn("Registration failed: duplicate user", {
                action: "REGISTER",
                email,
                duplicateField: field,
            });

            throw new AuthError(errorCode, `Duplicate ${field}`, { email, field });
        }

        // Hash password
        logger.debug("Hashing password", { action: "REGISTER_DEBUG" });
        const hashedPassword = await hashPassword(password);

        // Create user with atomic LandlordVerification if needed
        logger.debug("Creating user in database", { action: "REGISTER_DEBUG", role });
        const user = await prisma.user.create({
            data: {
                email,
                phone: formattedPhone,
                password: hashedPassword,
                firstName,
                lastName,
                role: role as "TENANT" | "LANDLORD",
                landlordVerification:
                    role === "LANDLORD"
                        ? {
                            create: {
                                status: "PENDING",
                                tier: "BASIC",
                            },
                        }
                        : undefined,
            },
        });

        // Generate tokens
        logger.debug("User created, generating tokens", { action: "REGISTER_DEBUG", userId: user.id });
        const tokenPayload = { userId: user.id, email: user.email, role: user.role };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Parallel execution of independent operations
        await Promise.all([
            storeRefreshToken(user.id, refreshToken),
            setAuthCookies(accessToken, refreshToken),
        ]);

        logger.info("User registered successfully", {
            action: "REGISTER",
            userId: user.id,
            role: user.role,
            email,
        });

        // Determine redirect based on role
        if (role === "LANDLORD") redirectPath = "/landlord/listings";

        return {
            success: true,
            redirectTo: redirectPath,
            timestamp: Date.now(),
        };
    } catch (error) {
        // Handle known auth errors
        if (isAuthError(error)) {
            logger.error("Registration failed", error, error.context);
            return error.toClientResponse();
        }

        // Parse Prisma errors (unique constraint violations, etc.)
        if (error && typeof error === "object" && "code" in error) {
            const authError = parsePrismaError(error);
            logger.error("Registration database error", authError, authError.context);
            return authError.toClientResponse();
        }

        // Handle unexpected errors
        logger.error("Registration unexpected error", error, {
            action: "REGISTER_ERROR",
            email,
            errorName: error instanceof Error ? error.name : 'Unknown',
            errorMessage: error instanceof Error ? error.message : String(error)
        });

        return {
            error: "An unexpected error occurred during registration. Please try again.",
            code: "INTERNAL_ERROR",
            timestamp: Date.now(),
        };
    }
}

// ============================================================================
// Forgot Password Action
// ============================================================================

/**
 * Server action for forgot password
 * Generates reset token and sends email
 * Always returns success to prevent email enumeration
 */
export async function forgotPasswordAction(
    prevState: ForgotPasswordState,
    formData: FormData
): Promise<ForgotPasswordState> {
    const rawData = Object.fromEntries(formData.entries());
    const email = (rawData.email as string)?.toLowerCase() || "";

    // Validate input
    const validationResult = forgotPasswordSchema.safeParse(rawData);
    if (!validationResult.success) {
        return {
            error: "Please enter a valid email address",
            code: "VALIDATION_ERROR",
            fieldErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
            timestamp: Date.now(),
        };
    }

    try {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, firstName: true, email: true },
        });

        // If user exists, generate and send reset token
        // We don't reveal whether user exists for security
        if (user) {
            // Generate secure random token
            const token = randomBytes(32).toString("hex");
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            // Delete any existing reset tokens for this user
            await prisma.passwordResetToken.deleteMany({
                where: { userId: user.id },
            });

            // Create new reset token
            await prisma.passwordResetToken.create({
                data: {
                    token,
                    userId: user.id,
                    expiresAt,
                },
            });

            // Send email (don't await to avoid revealing timing)
            sendPasswordResetEmail(user.email, token, user.firstName).then((result) => {
                if (result.success) {
                    logger.info("Password reset email sent", {
                        action: "FORGOT_PASSWORD",
                        email,
                        messageId: result.messageId,
                    });
                } else {
                    logger.error("Failed to send password reset email", undefined, {
                        action: "FORGOT_PASSWORD",
                        email,
                        error: result.error,
                    });
                }
            });
        } else {
            logger.info("Password reset requested for non-existent email", {
                action: "FORGOT_PASSWORD",
                email,
            });
        }

        // Always return success to prevent email enumeration
        return {
            success: true,
            timestamp: Date.now(),
        };
    } catch (error) {
        logger.error("Forgot password error", error, {
            action: "FORGOT_PASSWORD_ERROR",
            email,
            errorName: error instanceof Error ? error.name : 'Unknown',
            errorMessage: error instanceof Error ? error.message : String(error)
        });
        // Still return success to prevent information leakage
        return {
            success: true,
            timestamp: Date.now(),
        };
    }
}

// ============================================================================
// Reset Password Action
// ============================================================================

/**
 * Server action to reset password using token
 * Validates token, updates password, and invalidates all sessions
 */
export async function resetPasswordAction(
    prevState: ResetPasswordState,
    formData: FormData
): Promise<ResetPasswordState> {
    const rawData = Object.fromEntries(formData.entries());
    const token = rawData.token as string;

    // Validate input
    const validationResult = resetPasswordSchema.safeParse(rawData);
    if (!validationResult.success) {
        return {
            error: "Validation failed",
            code: "VALIDATION_ERROR",
            fieldErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
            timestamp: Date.now(),
        };
    }

    const { password } = validationResult.data;

    try {
        // Find the reset token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: { select: { id: true, email: true } } },
        });

        // Validate token exists
        if (!resetToken) {
            logger.warn("Password reset failed: invalid token", {
                action: "RESET_PASSWORD",
                tokenPrefix: token.slice(0, 8) + "...",
            });
            throw new AuthError("INVALID_TOKEN", "Token not found in database");
        }

        // Check if token was already used
        if (resetToken.usedAt) {
            logger.warn("Password reset failed: token already used", {
                action: "RESET_PASSWORD",
                userId: resetToken.userId,
            });
            throw new AuthError("TOKEN_ALREADY_USED", "Token was used at " + resetToken.usedAt);
        }

        // Check if token has expired
        if (resetToken.expiresAt < new Date()) {
            logger.warn("Password reset failed: token expired", {
                action: "RESET_PASSWORD",
                userId: resetToken.userId,
                expiredAt: resetToken.expiresAt,
            });
            throw new AuthError("TOKEN_EXPIRED", "Token expired at " + resetToken.expiresAt);
        }

        // Hash new password
        const hashedPassword = await hashPassword(password);

        // Update password and mark token as used in a transaction
        await prisma.$transaction([
            prisma.user.update({
                where: { id: resetToken.userId },
                data: { password: hashedPassword },
            }),
            prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { usedAt: new Date() },
            }),
        ]);

        // Invalidate all refresh tokens to force re-login on all devices
        await removeAllUserRefreshTokens(resetToken.userId);

        logger.info("Password reset successful", {
            action: "RESET_PASSWORD",
            userId: resetToken.userId,
            email: resetToken.user.email,
        });

        return {
            success: true,
            redirectTo: "/login",
            timestamp: Date.now(),
        };
    } catch (error) {
        // Handle known auth errors
        if (isAuthError(error)) {
            logger.error("Password reset failed", error, error.context);
            return error.toClientResponse();
        }

        // Handle unexpected errors
        logger.error("Password reset unexpected error", error, {
            action: "RESET_PASSWORD_ERROR",
            errorName: error instanceof Error ? error.name : 'Unknown',
            errorMessage: error instanceof Error ? error.message : String(error)
        });
        return {
            error: "An unexpected error occurred. Please try again.",
            code: "INTERNAL_ERROR",
            timestamp: Date.now(),
        };
    }
}
