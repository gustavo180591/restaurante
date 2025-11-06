/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }

  namespace NodeJS {
    interface ProcessEnv {
      // Database
      DATABASE_URL: string;
      
      // JWT
      JWT_SECRET: string;
      
      // Email
      EMAIL_FROM?: string;
      SMTP_HOST?: string;
      SMTP_PORT?: string;
      SMTP_SECURE?: string;
      SMTP_USER?: string;
      SMTP_PASSWORD?: string;
      
      // Storage
      STORAGE_DRIVER?: 'disk' | 's3';
      UPLOAD_DIR?: string;
      S3_REGION?: string;
      S3_BUCKET?: string;
      S3_ACCESS_KEY_ID?: string;
      S3_SECRET_ACCESS_KEY?: string;
      
      // Environment
      NODE_ENV?: 'development' | 'production';
      PORT?: string;
      ORIGIN?: string;
    }
  }
}

export {};
