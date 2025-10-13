import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  // Redirigir a la ruta de autenticación
  throw redirect(307, '/api/auth/login');
};
