/**
 * Email Service using Resend
 * 
 * Handles transactional emails for:
 * - Password reset
 * - Email verification (future)
 * - Welcome emails (future)
 */

import { Resend } from 'resend'

// Lazy-initialize Resend client only when needed
// This prevents errors when the API key isn't set (e.g., during login)
let resendClient: Resend | null = null

function getResendClient(): Resend {
    if (!resendClient) {
        if (!process.env.RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY environment variable is not set')
        }
        resendClient = new Resend(process.env.RESEND_API_KEY)
    }
    return resendClient
}

// App configuration
const APP_NAME = 'VerifiedNyumba'
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev'

interface EmailResult {
    success: boolean
    messageId?: string
    error?: string
}

/**
 * Send password reset email with secure reset link
 */
export async function sendPasswordResetEmail(
    to: string,
    resetToken: string,
    firstName: string
): Promise<EmailResult> {
    // Use VERCEL_URL (auto-set on Vercel) or localhost for local dev
    const vercelUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : null
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || vercelUrl || 'http://localhost:3000'
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`

    try {
        const { data, error } = await getResendClient().emails.send({
            from: `${APP_NAME} <${FROM_EMAIL}>`,
            to: [to],
            subject: 'Reset your password - VerifiedNyumba',
            html: generatePasswordResetHTML(firstName, resetUrl),
            text: generatePasswordResetText(firstName, resetUrl),
        })

        if (error) {
            console.error('[Email] Resend error:', error)
            return { success: false, error: error.message }
        }

        console.log('[Email] Password reset email sent:', data?.id)
        return { success: true, messageId: data?.id }
    } catch (error) {
        console.error('[Email] Failed to send password reset email:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send email',
        }
    }
}

/**
 * Generate HTML email template for password reset
 */
function generatePasswordResetHTML(firstName: string, resetUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background-color: #0d9488; border-radius: 12px 12px 0 0;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                                VerifiedNyumba
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #18181b;">
                                Reset Your Password
                            </h2>
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #52525b;">
                                Hi ${firstName},
                            </p>
                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #52525b;">
                                We received a request to reset your password. Click the button below to create a new password. This link will expire in <strong>1 hour</strong>.
                            </p>
                            
                            <!-- Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center">
                                        <a href="${resetUrl}" 
                                           style="display: inline-block; padding: 14px 32px; background-color: #0d9488; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 20px; font-size: 14px; line-height: 1.6; color: #71717a;">
                                If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
                            </p>
                            
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #71717a;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style="margin: 10px 0 0; font-size: 12px; line-height: 1.4; color: #0d9488; word-break: break-all;">
                                ${resetUrl}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 40px; background-color: #f4f4f5; border-radius: 0 0 12px 12px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #71717a;">
                                © ${new Date().getFullYear()} VerifiedNyumba. All rights reserved.
                            </p>
                            <p style="margin: 10px 0 0; font-size: 12px; color: #a1a1aa;">
                                Helping you find verified homes in Kenya
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`
}

/**
 * Generate plain text version for email clients that don't support HTML
 */
function generatePasswordResetText(firstName: string, resetUrl: string): string {
    return `
Hi ${firstName},

We received a request to reset your password for your VerifiedNyumba account.

Click the link below to create a new password (expires in 1 hour):
${resetUrl}

If you didn't request this, you can safely ignore this email. Your password will remain unchanged.

---
VerifiedNyumba
Helping you find verified homes in Kenya
`
}
