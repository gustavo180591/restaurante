// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    
    interface Locals {
      user: {
        id: number;
        role: 'Admin' | 'Operador' | 'Mozo';
        sessionVersion: number;
      } | null;
      cid: string;
    }

    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
