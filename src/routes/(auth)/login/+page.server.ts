import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
    default: async ({ request, cookies, fetch, url }) => {
        const data = await request.formData();
        const email = data.get('email') as string;
        const password = data.get('password') as string;
        const rememberMe = data.get('remember-me') === 'on';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email, 
                    password, 
                    rememberMe 
                }),
                credentials: 'include' // Importante para enviar/recibir cookies
            });

            const result = await response.json();

            if (!response.ok) {
                return fail(response.status, { 
                    error: result.message || 'Error de autenticación',
                    email,
                    rememberMe
                });
            }

            // Redirigir a la página de origen o a la página principal
            const redirectTo = url.searchParams.get('redirectTo') || '/';
            throw redirect(303, redirectTo);

        } catch (error) {
            console.error('Login error:', error);
            
            if (error instanceof Error && 'status' in error && error.status === 303) {
                throw error; // Dejar que SvelteKit maneje la redirección
            }
            
            return fail(500, {
                error: 'Error al conectar con el servidor',
                email,
                rememberMe
            });
        }
    }
} satisfies Actions;
