<script lang="ts">
  import { page } from '$app/stores';
  
  // Estado para el menú móvil
  let mobileMenuOpen = false;
  
  // Obtener la ruta actual para resaltar el enlace activo
  $: currentPath = $page.url.pathname;
</script>

<header class="bg-white shadow-sm sticky top-0 z-40">
  <nav class="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4 sm:space-x-6">
        <a href="/" class="flex items-center space-x-2">
          <div class="w-8 h-8 sm:w-10 sm:h-10 bg-amber-600 rounded-full flex items-center justify-center">
            <span class="text-white font-bold text-base sm:text-lg">R</span>
          </div>
          <span class="text-lg sm:text-xl font-bold text-gray-900">Restaurante del Chef</span>
        </a>
        
        <!-- Navegación de escritorio -->
        <div class="hidden md:flex items-center space-x-4 lg:space-x-6">
          <a href="/" class="text-sm sm:text-base text-gray-600 hover:text-amber-600 transition-colors font-medium {currentPath === '/' ? 'text-amber-600' : ''}">Inicio</a>
          <a href="/menu" class="text-sm sm:text-base text-gray-600 hover:text-amber-600 transition-colors font-medium {currentPath === '/menu' ? 'text-amber-600' : ''}">Menú</a>
          <a href="/sobre-nosotros" class="text-sm sm:text-base text-gray-600 hover:text-amber-600 transition-colors font-medium {currentPath === '/sobre-nosotros' ? 'text-amber-600' : ''}">Sobre Nosotros</a>
          <a href="/contacto" class="text-sm sm:text-base text-gray-600 hover:text-amber-600 transition-colors font-medium {currentPath === '/contacto' ? 'text-amber-600' : ''}">Contacto</a>
        </div>
      </div>
      
      <div class="flex items-center space-x-3 sm:space-x-4">
        <!-- Botones de autenticación -->
        <div class="hidden md:flex items-center space-x-3 lg:space-x-4">
          <a 
            href="/login" 
            class="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors {currentPath === '/login' ? 'text-amber-600' : ''}"
          >
            Iniciar Sesión
          </a>
          <a 
            href="/registro" 
            class="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 transition-colors {currentPath === '/registro' ? 'bg-amber-700' : ''}"
          >
            Registrarse
          </a>
        </div>
        
        <!-- Carrito -->
        <button class="relative bg-amber-600 hover:bg-amber-700 text-white p-2 sm:p-3 rounded-full transition-colors shadow-lg hover:shadow-xl" aria-label="Ver carrito de compras">
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
        
        <!-- Botón móvil -->
        <button 
          class="md:hidden text-gray-600 hover:text-gray-900 p-1" 
          aria-label="Menú móvil"
          on:click={() => (mobileMenuOpen = !mobileMenuOpen)}
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Menú móvil -->
    {#if mobileMenuOpen}
      <div class="md:hidden mt-3 sm:mt-4 pb-3 sm:pb-4 border-t border-gray-200">
        <div class="pt-3 sm:pt-4 space-y-2 sm:space-y-3">
          <a 
            href="/" 
            class="block px-3 py-2 text-sm sm:text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-gray-50 rounded-md {currentPath === '/' ? 'text-amber-600 bg-gray-50' : ''}"
            on:click={() => mobileMenuOpen = false}
          >
            Inicio
          </a>
          <a 
            href="/menu" 
            class="block px-3 py-2 text-sm sm:text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-gray-50 rounded-md {currentPath === '/menu' ? 'text-amber-600 bg-gray-50' : ''}"
            on:click={() => mobileMenuOpen = false}
          >
            Menú
          </a>
          <a 
            href="/sobre-nosotros" 
            class="block px-3 py-2 text-sm sm:text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-gray-50 rounded-md {currentPath === '/sobre-nosotros' ? 'text-amber-600 bg-gray-50' : ''}"
            on:click={() => mobileMenuOpen = false}
          >
            Sobre Nosotros
          </a>
          <a 
            href="/contacto" 
            class="block px-3 py-2 text-sm sm:text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-gray-50 rounded-md {currentPath === '/contacto' ? 'text-amber-600 bg-gray-50' : ''}"
            on:click={() => mobileMenuOpen = false}
          >
            Contacto
          </a>
          <div class="pt-2 border-t border-gray-200">
            <a 
              href="/login" 
              class="block w-full text-center px-4 py-2 text-sm sm:text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-gray-50 rounded-md {currentPath === '/login' ? 'text-amber-600 bg-gray-50' : ''}"
              on:click={() => mobileMenuOpen = false}
            >
              Iniciar Sesión
            </a>
            <a 
              href="/registro" 
              class="mt-2 block w-full text-center px-4 py-2 text-sm sm:text-base font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 transition-colors {currentPath === '/registro' ? 'bg-amber-700' : ''}"
              on:click={() => mobileMenuOpen = false}
            >
              Registrarse
            </a>
          </div>
        </div>
      </div>
    {/if}
  </nav>
</header>

<style>
  a, button {
    transition: all 0.2s ease-in-out;
  }
</style>
