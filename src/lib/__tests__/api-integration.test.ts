import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

// Configurar cliente de Prisma para tests
const prisma = new PrismaClient();

describe('API Endpoints - Tests de Integración', () => {
  beforeAll(async () => {
    // Limpiar datos de prueba
    await prisma.cartaDetalle.deleteMany();
    await prisma.cartas.deleteMany();
    await prisma.platos_has_MenuEspTipoPlato.deleteMany();
    await prisma.menuEspTipoPlato.deleteMany();
    await prisma.menuEspecialidad.deleteMany();
    await prisma.menu.deleteMany();
    await prisma.turnosMenu.deleteMany();
    await prisma.platos.deleteMany();
    await prisma.fotos.deleteMany();
    await prisma.tipoPlato.deleteMany();
    await prisma.especialidades.deleteMany();
    await prisma.estados.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/estados', () => {
    it('debería devolver lista de estados', async () => {
      // Crear datos de prueba
      await prisma.estados.createMany({
        data: [
          { NombEstado: 'Activo' },
          { NombEstado: 'Inactivo' }
        ]
      });

      const response = await fetch('http://localhost:3000/api/estados');
      expect(response.status).toBe(200);

      const estados = await response.json();
      expect(Array.isArray(estados)).toBe(true);
      expect(estados.length).toBeGreaterThan(0);
      expect(estados[0]).toHaveProperty('id');
      expect(estados[0]).toHaveProperty('nombre');
    });
  });

  describe('GET /api/tipos-plato', () => {
    it('debería devolver lista de tipos de plato', async () => {
      // Crear datos de prueba
      await prisma.tipoPlato.createMany({
        data: [
          { NombreTipo: 'Entrada' },
          { NombreTipo: 'Principal' },
          { NombreTipo: 'Postre' }
        ]
      });

      const response = await fetch('http://localhost:3000/api/tipos-plato');
      expect(response.status).toBe(200);

      const tipos = await response.json();
      expect(Array.isArray(tipos)).toBe(true);
      expect(tipos.length).toBeGreaterThan(0);
      expect(tipos[0]).toHaveProperty('id');
      expect(tipos[0]).toHaveProperty('nombre');
    });
  });

  describe('POST /api/platos', () => {
    it('debería crear un nuevo plato', async () => {
      // Crear foto de prueba primero
      const foto = await prisma.fotos.create({
        data: {
          Ruta: '/test-imagen.jpg',
          Tipo: 'image/jpeg'
        }
      });

      const nuevoPlato = {
        NombrePlato: 'Milanesa con papas',
        Descripcion: 'Milanesa de carne con papas fritas',
        Precio: 1500,
        Fotos_Id_Foto: foto.Id_Foto
      };

      const response = await fetch('http://localhost:3000/api/platos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoPlato)
      });

      expect(response.status).toBe(201);
      const platoCreado = await response.json();
      expect(platoCreado).toHaveProperty('id');
      expect(platoCreado.nombre).toBe(nuevoPlato.NombrePlato);
      expect(platoCreado.precio).toBe(nuevoPlato.Precio);
    });
  });

  describe('GET /api/platos', () => {
    it('debería devolver lista de platos activos', async () => {
      const response = await fetch('http://localhost:3000/api/platos');
      expect(response.status).toBe(200);

      const platos = await response.json();
      expect(Array.isArray(platos)).toBe(true);

      // Verificar estructura de respuesta
      if (platos.length > 0) {
        expect(platos[0]).toHaveProperty('id');
        expect(platos[0]).toHaveProperty('nombre');
        expect(platos[0]).toHaveProperty('precio');
        expect(platos[0]).toHaveProperty('descripcion');
        expect(platos[0]).toHaveProperty('foto');
        expect(platos[0]).toHaveProperty('tipos');
        expect(platos[0]).toHaveProperty('especialidades');
        expect(platos[0]).toHaveProperty('disponible');
      }
    });
  });

  describe('GET /api/cartas', () => {
    it('debería devolver lista de cartas', async () => {
      const response = await fetch('http://localhost:3000/api/cartas');
      expect(response.status).toBe(200);

      const cartas = await response.json();
      expect(Array.isArray(cartas)).toBe(true);

      // Verificar estructura de respuesta
      if (cartas.length > 0) {
        expect(cartas[0]).toHaveProperty('id');
        expect(cartas[0]).toHaveProperty('fecha');
        expect(cartas[0]).toHaveProperty('turno');
        expect(cartas[0]).toHaveProperty('estado');
        expect(cartas[0]).toHaveProperty('platos');
      }
    });
  });

  describe('GET /api/menus', () => {
    it('debería devolver lista de menús', async () => {
      const response = await fetch('http://localhost:3000/api/menus');
      expect(response.status).toBe(200);

      const menus = await response.json();
      expect(Array.isArray(menus)).toBe(true);

      // Verificar estructura de respuesta
      if (menus.length > 0) {
        expect(menus[0]).toHaveProperty('id');
        expect(menus[0]).toHaveProperty('nombre');
        expect(menus[0]).toHaveProperty('descripcion');
        expect(menus[0]).toHaveProperty('fecha');
        expect(menus[0]).toHaveProperty('activo');
        expect(menus[0]).toHaveProperty('estado');
        expect(menus[0]).toHaveProperty('turno');
        expect(menus[0]).toHaveProperty('totalPlatos');
        expect(menus[0]).toHaveProperty('especialidades');
        expect(menus[0]).toHaveProperty('tiposPlato');
      }
    });
  });
});
