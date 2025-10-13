import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { user } = await parent();
  
  // Si el usuario ya está autenticado, redirigir al dashboard
  if (user) {
    throw redirect(307, '/admin');
  }
  
  return {};
};
