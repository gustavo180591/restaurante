// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface PageState {}
    // interface Platform {}
    
    interface Locals {
      user: {
        id: string;
        email: string;
        dni: string;
        name: string | null;
        role: 'USER' | 'ADMIN';
      } | null;
      sessionId: string | null;
      cid: string;
    }

    interface PageData {
      user: {
        id: string;
        email: string;
        dni: string;
        name: string | null;
        role: 'USER' | 'ADMIN';
      } | null;
    }
  }
}

export {};
