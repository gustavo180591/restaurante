import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { JWT_SECRET } from '$env/static/private';
import { createHash } from 'crypto';
import { compare, hash } from 'bcryptjs';

// Helper to hash the reset token for database lookup
function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

export async function POST({ request }) {
    try {
        const { token, password, confirmPassword } = await request.json();

        // Validate input
        if (!token || !password || !confirmPassword) {
            return json(
                { success: false, message: 'Todos los campos son requeridos' },
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return json(
                { success: false, message: 'Las contraseñas no coinciden' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return json(
                { success: false, message: 'La contraseña debe tener al menos 8 caracteres' },
                { status: 400 }
            );
        }

        // Find the reset token
        const hashedToken = hashToken(token);
        const resetToken = await prisma.passwordResetToken.findFirst({
            where: {
                token: hashedToken,
                expiresAt: { gt: new Date() } // Not expired
            },
            include: { user: true }
        });

        if (!resetToken) {
            return json(
                { success: false, message: 'El enlace de recuperación es inválido o ha expirado' },
                { status: 400 }
            );
        }

        // Check if the new password is different from the current one
        const isSamePassword = await compare(password, resetToken.user.clave);
        if (isSamePassword) {
            return json(
                { success: false, message: 'La nueva contraseña debe ser diferente a la actual' },
                { status: 400 }
            );
        }

        // Hash the new password
        const hashedPassword = await hash(password, 12);

        // Update user's password and increment session version
        await prisma.$transaction([
            prisma.usuarios.update({
                where: { Id_usuario: resetToken.userId },
                data: {
                    clave: hashedPassword,
                    sessionVersion: { increment: 1 } // Invalidate existing sessions
                }
            }),
            // Delete the used token
            prisma.passwordResetToken.deleteMany({
                where: { userId: resetToken.userId }
            })
        ]);

        return json(
            { success: true, message: 'Contraseña actualizada correctamente' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error resetting password:', error);
        return json(
            { success: false, message: 'Error al restablecer la contraseña' },
            { status: 500 }
        );
    }
}
