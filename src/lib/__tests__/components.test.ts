import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import Header from '../components/Header.svelte';

describe('Componentes - Tests Básicos', () => {
  describe('Header.svelte', () => {
    it('debería renderizar correctamente', () => {
      render(Header);

      // Verificar que elementos básicos estén presentes
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByText(/restaurante/i)).toBeInTheDocument();
    });

    it('debería mostrar navegación principal', () => {
      render(Header);

      // Verificar enlaces de navegación
      expect(screen.getByText(/inicio/i)).toBeInTheDocument();
      expect(screen.getByText(/menú/i)).toBeInTheDocument();
      expect(screen.getByText(/sobre nosotros/i)).toBeInTheDocument();
      expect(screen.getByText(/reservas/i)).toBeInTheDocument();
    });

    it('debería tener botón de menú móvil', () => {
      render(Header);

      const menuButton = screen.getByRole('button', { name: /menu/i });
      expect(menuButton).toBeInTheDocument();
    });
  });
});
