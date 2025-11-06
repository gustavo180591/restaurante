import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { JWT_SECRET } from '$env/static/private';
import { randomBytes } from 'crypto';
import { createHash } from 'crypto';
import { sendPasswordResetEmail } from '$lib/server/email';

// Helper to hash the reset token for database storage
function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

export async function POST({ request }) {
    try {
        const { email } = await request.json();

        if (!email) {
            return json(
                { success: false, message: 'Email es requerido' },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await prisma.usuarios.findUnique({
            where: { email }
        });

        // Don't reveal if the email exists or not
        if (!user) {
            // For security, we don't want to reveal if the email exists or not
            return json(
                { success: true, message: 'Si el correo existe, se ha enviado un enlace de recuperación' },
                { status: 200 }
            );
        }

        // Generate reset token
        const resetToken = randomBytes(32).toString('hex');
        const hashedToken = hashToken(resetToken);
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

        // Delete any existing reset tokens for this user
        await prisma.passwordResetToken.deleteMany({
            where: { userId: user.Id_usuario }
        });

        // Create new reset token
        await prisma.passwordResetToken.create({
            data: {
                token: hashedToken,
                expiresAt,
                userId: user.Id_usuario
            }
        });

        // Send email with reset link
        const resetUrl = `${new URL(request.url).origin}/recuperar-contrasena/${resetToken}`;
        
        try {
            await sendPasswordResetEmail(user.email, resetUrl, user.usuario);
            console.log(`Password reset email sent to ${user.email}`);
        } catch (emailError) {
            console.error('Error sending password reset email:', emailError);
            // Don't fail the request if email sending fails
        }

        return json(
            { success: true, message: 'Si el correo existe, se ha enviado un enlace de recuperación' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in forgot password:', error);
        return json(
            { success: false, message: 'Error al procesar la solicitud' },
            { status: 500 }
        );
    }
}
