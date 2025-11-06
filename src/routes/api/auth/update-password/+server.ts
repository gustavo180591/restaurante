import { json, type RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/db/prisma';
import { hash } from 'bcryptjs';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { email, newPassword } = await request.json();
        
        if (!email || !newPassword) {
            return json(
                { success: false, message: 'Email and new password are required' },
                { status: 400 }
            );
        }

        // Hash the new password
        const hashedPassword = await hash(newPassword, 12);
        
        // Update the user's password
        const updatedUser = await prisma.usuarios.update({
            where: { email },
            data: { 
                clave: hashedPassword,
                sessionVersion: { increment: 1 } // Invalidate existing sessions
            }
        });

        if (!updatedUser) {
            return json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        return json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Error updating password:', error);
        return json(
            { success: false, message: 'Error updating password' },
            { status: 500 }
        );
    }
};
