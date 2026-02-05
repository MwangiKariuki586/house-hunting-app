"use server";

import { redirect } from "next/navigation";
import prisma from "@/app/lib/prisma";
import {
    comparePassword,
    hashPassword,
    generateAccessToken,
    generateRefreshToken,
    storeRefreshToken,
    setAuthCookies,
} from "@/app/lib/auth";
import { loginSchema, registerSchema, formatKenyanPhone } from "@/app/lib/validations/auth";
import { logger } from "@/app/lib/logger";

export type LoginState = {
    success?: boolean;
    error?: string;
    fieldErrors?: Record<string, string[]>;
    redirectTo?: string;
    timestamp?: number;
};

/**
 * Server action for user login
 * Validates credentials, generates tokens, and returns redirect path
 */
export async function loginAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
    const rawData = Object.fromEntries(formData.entries());

    const validationResult = loginSchema.safeParse(rawData);
    if (!validationResult.success) {
        return {
            error: "Validation failed",
            fieldErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
            timestamp: Date.now(),
        };
    }

    const { email, password } = validationResult.data;
    let redirectPath = "/properties";

    try {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user || !(await comparePassword(password, user.password))) {
            return { error: "Invalid email or password", timestamp: Date.now() };
        }

        const tokenPayload = { userId: user.id, email: user.email, role: user.role };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Parallel execution of independent operations
        await Promise.all([
            storeRefreshToken(user.id, refreshToken),
            prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
            }),
            setAuthCookies(accessToken, refreshToken)
        ]);

        logger.info("User logged in", { userId: user.id, role: user.role });

        // Determine redirect based on role
        if (user.role === "LANDLORD") redirectPath = "/landlord/listings";
        else if (user.role === "ADMIN") redirectPath = "/admin";

    } catch (error) {
        logger.error("Login error", error);
        return { error: "An unexpected error occurred", timestamp: Date.now() };
    }

    return {
        success: true,
        redirectTo: redirectPath,
        timestamp: Date.now(),
    };
}

export type RegisterState = {
    success?: boolean;
    error?: string;
    fieldErrors?: Record<string, string[]>;
    redirectTo?: string;
    timestamp?: number;
};

/**
 * Server action for user registration
 * Creates account, generates tokens, and returns redirect path based on role
 */
export async function registerAction(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
    const rawData = Object.fromEntries(formData.entries());

    const validationResult = registerSchema.safeParse(rawData);
    if (!validationResult.success) {
        return {
            error: "Validation failed",
            fieldErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
            timestamp: Date.now(),
        };
    }

    const { email, phone, password, firstName, lastName, role } = validationResult.data;
    let redirectPath = "/properties";

    console.log(`[Register] Starting registration for email: ${email.toLowerCase()}, role: ${role}`);

    try {
        // Format phone number to international format
        const formattedPhone = formatKenyanPhone(phone);

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email: email.toLowerCase() }, { phone: formattedPhone }],
            },
        });

        if (existingUser) {
            const field = existingUser.email === email.toLowerCase() ? 'email' : 'phone';
            return {
                error: `A user with this ${field} already exists`,
                timestamp: Date.now()
            };
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user with atomic LandlordVerification if needed
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                phone: formattedPhone,
                password: hashedPassword,
                firstName,
                lastName,
                role: role as 'TENANT' | 'LANDLORD',
                // Create LandlordVerification entry atomically if role is LANDLORD
                landlordVerification: role === 'LANDLORD' ? {
                    create: {
                        status: 'PENDING',
                        tier: 'BASIC'
                    }
                } : undefined
            },
        });

        // Generate tokens
        const tokenPayload = { userId: user.id, email: user.email, role: user.role };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Parallel execution of independent operations
        await Promise.all([
            storeRefreshToken(user.id, refreshToken),
            setAuthCookies(accessToken, refreshToken)
        ]);

        console.log(`[Register] Success for userId: ${user.id}, role: ${user.role}`);
        logger.info("User registered", { userId: user.id, role: user.role });

        // Determine redirect based on role
        if (role === "LANDLORD") redirectPath = "/landlord/listings";

    } catch (error) {
        console.error("[Register] Error:", error);
        logger.error("Registration error", error instanceof Error ? error.message : String(error));

        // Check for specific Prisma errors (optional enhancement)
        // if (error.code === 'P2002') return { error: "User already exists" };

        return {
            error: "An unexpected error occurred during registration. Please try again.",
            timestamp: Date.now()
        };
    }

    return {
        success: true,
        redirectTo: redirectPath,
        timestamp: Date.now(),
    };
}

