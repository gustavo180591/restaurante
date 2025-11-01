import { createClient, RedisClientType } from 'redis';

// Configuración de Redis
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const DEFAULT_TTL = parseInt(process.env.REDIS_TTL || '300'); // 5 minutos por defecto

class CacheManager {
  private client: RedisClientType | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    try {
      if (this.isConnected) return;

      this.client = createClient({
        url: REDIS_URL,
        socket: {
          connectTimeout: 60000,
          lazyConnect: true,
        },
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('✅ Conectado a Redis');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.error('❌ Error conectando a Redis:', error);
      this.isConnected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const data = await this.client.get(key);
      if (data) {
        return JSON.parse(data) as T;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo de caché:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = DEFAULT_TTL): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      const serializedValue = JSON.stringify(value);
      await this.client.setEx(key, ttl, serializedValue);
    } catch (error) {
      console.error('Error guardando en caché:', error);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Error eliminando de caché:', error);
    }
  }

  async clear(): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      await this.client.flushAll();
    } catch (error) {
      console.error('Error limpiando caché:', error);
    }
  }

  generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  // Método para verificar conexión
  async ping(): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      return false;
    }
  }
}

// Instancia singleton
export const cacheManager = new CacheManager();

// Funciones de conveniencia para diferentes tipos de datos
export const cache = {
  // Estados del sistema
  estados: {
    async get(): Promise<any[]> {
      const key = cacheManager.generateKey('estados');
      return await cacheManager.get<any[]>(key) || [];
    },

    async set(data: any[]): Promise<void> {
      const key = cacheManager.generateKey('estados');
      await cacheManager.set(key, data, 600); // 10 minutos
    }
  },

  // Tipos de plato
  tiposPlato: {
    async get(): Promise<any[]> {
      const key = cacheManager.generateKey('tipos_plato');
      return await cacheManager.get<any[]>(key) || [];
    },

    async set(data: any[]): Promise<void> {
      const key = cacheManager.generateKey('tipos_plato');
      await cacheManager.set(key, data, 600); // 10 minutos
    }
  },

  // Especialidades
  especialidades: {
    async get(): Promise<any[]> {
      const key = cacheManager.generateKey('especialidades');
      return await cacheManager.get<any[]>(key) || [];
    },

    async set(data: any[]): Promise<void> {
      const key = cacheManager.generateKey('especialidades');
      await cacheManager.set(key, data, 600); // 10 minutos
    }
  },

  // Menús con platos
  menus: {
    async get(id?: number): Promise<any> {
      const key = cacheManager.generateKey('menu', id || 'list');
      return await cacheManager.get<any>(key);
    },

    async set(data: any, id?: number, ttl: number = 300): Promise<void> {
      const key = cacheManager.generateKey('menu', id || 'list');
      await cacheManager.set(key, data, ttl);
    }
  },

  // Cartas del día
  cartas: {
    async get(fecha?: string): Promise<any[]> {
      const key = cacheManager.generateKey('cartas', fecha || 'list');
      return await cacheManager.get<any[]>(key) || [];
    },

    async set(data: any[], fecha?: string, ttl: number = 1800): Promise<void> {
      const key = cacheManager.generateKey('cartas', fecha || 'list');
      await cacheManager.set(key, data, ttl); // 30 minutos
    }
  },

  // Utilidades
  utils: {
    async invalidatePattern(pattern: string): Promise<void> {
      if (!cacheManager.client) return;

      try {
        const keys = await cacheManager.client.keys(pattern);
        if (keys.length > 0) {
          await cacheManager.client.del(keys);
        }
      } catch (error) {
        console.error('Error invalidando patrón de caché:', error);
      }
    },

    async getStats(): Promise<any> {
      if (!cacheManager.client) return null;

      try {
        const info = await cacheManager.client.info('memory');
        const keyspace = await cacheManager.client.info('keyspace');

        return {
          connected: cacheManager.isConnected,
          memory: info,
          keyspace: keyspace,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error obteniendo stats de caché:', error);
        return null;
      }
    }
  }
};

// Inicializar conexión al importar
cacheManager.connect().catch(console.error);

export default cacheManager;
