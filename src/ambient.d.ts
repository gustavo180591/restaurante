declare module 'tailwindcss';
declare module '@tailwindcss/forms';

declare namespace App {
  interface PrivateEnv {
    JWT_SECRET: string;
    DATABASE_URL: string;
  }
}
