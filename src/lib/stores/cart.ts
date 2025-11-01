// src/lib/stores/cart.ts
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  foto?: string;
  nota?: string;
  disponible: boolean;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

// Estado inicial del carrito
const initialState: CartState = {
  items: [],
  isOpen: false
};

// Crear el store del carrito
export const cartStore = writable<CartState>(initialState);

// Funciones para manipular el carrito
export const cartActions = {
  // Agregar producto al carrito
  addItem: (producto: Omit<CartItem, 'cantidad'>, cantidad: number = 1, nota?: string) => {
    cartStore.update(state => {
      const existingItem = state.items.find(item => item.id === producto.id);

      if (existingItem) {
        // Si ya existe, incrementar cantidad
        existingItem.cantidad += cantidad;
        if (nota) existingItem.nota = nota;
      } else {
        // Si no existe, agregar nuevo
        state.items.push({
          ...producto,
          cantidad,
          nota
        });
      }

      // Guardar en localStorage si estamos en el navegador
      if (browser) {
        localStorage.setItem('cart', JSON.stringify(state.items));
      }

      return state;
    });
  },

  // Remover producto del carrito
  removeItem: (id: number) => {
    cartStore.update(state => {
      state.items = state.items.filter(item => item.id !== id);

      // Guardar en localStorage si estamos en el navegador
      if (browser) {
        localStorage.setItem('cart', JSON.stringify(state.items));
      }

      return state;
    });
  },

  // Actualizar cantidad de un producto
  updateQuantity: (id: number, cantidad: number) => {
    if (cantidad <= 0) {
      cartActions.removeItem(id);
      return;
    }

    cartStore.update(state => {
      const item = state.items.find(item => item.id === id);
      if (item) {
        item.cantidad = cantidad;
      }

      // Guardar en localStorage si estamos en el navegador
      if (browser) {
        localStorage.setItem('cart', JSON.stringify(state.items));
      }

      return state;
    });
  },

  // Actualizar nota de un producto
  updateNote: (id: number, nota: string) => {
    cartStore.update(state => {
      const item = state.items.find(item => item.id === id);
      if (item) {
        item.nota = nota;
      }

      // Guardar en localStorage si estamos en el navegador
      if (browser) {
        localStorage.setItem('cart', JSON.stringify(state.items));
      }

      return state;
    });
  },

  // Vaciar carrito
  clearCart: () => {
    cartStore.update(state => {
      state.items = [];

      // Limpiar localStorage si estamos en el navegador
      if (browser) {
        localStorage.removeItem('cart');
      }

      return state;
    });
  },

  // Abrir/cerrar mini-cart
  toggleCart: () => {
    cartStore.update(state => {
      state.isOpen = !state.isOpen;
      return state;
    });
  },

  // Cerrar mini-cart
  closeCart: () => {
    cartStore.update(state => {
      state.isOpen = false;
      return state;
    });
  }
};

// Stores derivados para información útil
export const cartItems = derived(cartStore, $cart => $cart.items);
export const cartTotal = derived(cartStore, $cart =>
  $cart.items.reduce((total, item) => total + (item.precio * item.cantidad), 0)
);
export const cartItemCount = derived(cartStore, $cart =>
  $cart.items.reduce((count, item) => count + item.cantidad, 0)
);
export const cartIsEmpty = derived(cartStore, $cart => $cart.items.length === 0);

// Función para inicializar carrito desde localStorage
export const initializeCart = () => {
  if (browser) {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        
        // Ensure the parsed data is an array
        const items = Array.isArray(parsedCart) 
          ? parsedCart 
          : (parsedCart.items || []);
        
        // Ensure each item has the required properties
        const validItems = items.map((item: any) => ({
          id: Number(item.id) || 0,
          nombre: String(item.nombre || ''),
          precio: Number(item.precio) || 0,
          cantidad: Number(item.cantidad) || 1,
          foto: item.foto || '',
          nota: item.nota || '',
          disponible: Boolean(item.disponible !== false)
        })).filter((item: { id: number }) => item.id > 0); // Only keep items with valid IDs

        cartStore.update(state => ({
          ...state,
          items: validItems
        }));
      } catch (error) {
        console.error('Error al cargar carrito desde localStorage:', error);
        // Reset to empty cart if there's an error
        cartStore.update(state => ({
          ...state,
          items: []
        }));
        // Clear invalid cart data
        localStorage.removeItem('cart');
      }
    }
  }
};