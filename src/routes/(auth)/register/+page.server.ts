// Registration server logic here
// src/routes/(auth)/register/+page.server.ts
export const load = async ({ locals }) => {
  if (locals.user) {
    return { redirect: '/' };
  }
  return {};
};