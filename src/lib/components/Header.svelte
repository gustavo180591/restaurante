<script lang="ts">
  import { page } from '$app/stores';
  
  // Estado para el menú móvil
  let mobileMenuOpen = false;
  
  // Obtener la ruta actual para resaltar el enlace activo
  $: currentPath = $page.url.pathname;
</script>

<header class="bg-white border-b border-gray-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <!-- Logo -->
      <div class="flex-shrink-0 flex items-center">
        <a href="/" class="flex items-center">
          <!-- Logo placeholder - reemplaza con tu logo -->
          <div class="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span class="text-gray-500 font-bold text-lg">R</span>
          </div>
          <span class="ml-3 text-xl font-bold text-gray-800">RESTAURANTE</span>
        </a>
      </div>
      
      <!-- Navegación de escritorio -->
      <nav class="hidden md:ml-6 md:flex md:items-center md:space-x-6">
        <a 
          href="/login" 
          class="px-3 py-2 text-sm font-medium text-gray-500 hover:text-amber-600 transition-colors duration-200 {currentPath === '/login' ? 'text-amber-600' : ''}"
        >
          INICIAR SESIÓN
        </a>
        <a 
          href="/registro" 
          class="px-3 py-2 text-sm font-medium text-gray-500 hover:text-amber-600 transition-colors duration-200 {currentPath === '/registro' ? 'text-amber-600' : ''}"
        >
          REGISTRARSE
        </a>
      </nav>
      
      <!-- Botón móvil -->
      <div class="-mr-2 flex items-center md:hidden">
        <button 
          type="button" 
          class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
          on:click={() => (mobileMenuOpen = !mobileMenuOpen)}
        >
          <span class="sr-only">Abrir menú principal</span>
          <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>
  
  <!-- Menú móvil - Solo se muestra en páginas que no sean registro -->
  {#if currentPath !== '/registro'}
    <div class="md:hidden {mobileMenuOpen ? 'fixed inset-0 z-50' : 'hidden'}">
      <!-- Fondo oscuro -->
      <div 
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        on:click|self={() => mobileMenuOpen = false}
      ></div>
      
      <!-- Contenido del menú -->
      <div class="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white shadow-xl">
        <div class="flex flex-col h-full p-6">
          <!-- Botón de cerrar -->
          <div class="flex justify-end mb-8">
            <button 
              type="button" 
              class="p-2 -mr-2 text-gray-400 hover:text-gray-500"
              on:click={() => mobileMenuOpen = false}
            >
              <span class="sr-only">Cerrar menú</span>
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Enlaces del menú -->
          <nav class="flex-1 flex flex-col justify-center space-y-8">
            <a 
              href="/login" 
              class="text-2xl font-medium text-center text-gray-900 hover:text-amber-600 px-4 py-3"
              on:click={() => mobileMenuOpen = false}
            >
              INICIAR SESIÓN
            </a>
            <a 
              href="/registro" 
              class="text-2xl font-medium text-center text-gray-900 hover:text-amber-600 px-4 py-3"
              on:click={() => mobileMenuOpen = false}
            >
              REGISTRARSE
            </a>
          </nav>
        </div>
      </div>
    </div>
  {/if}
</header>

<style>
  a, button {
    transition: all 0.2s ease-in-out;
  }
  
  /* Animación de entrada del menú */
  .fixed.inset-0.z-50 > div:last-child {
    animation: slideIn 0.3s ease-out forwards;
  }
  
  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
</style>
