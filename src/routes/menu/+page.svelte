<script lang="ts">
  import { onMount } from 'svelte';
  
  // Tipos
  type Plato = {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen: string;
    categoria: string;
  };

  // Estado
  let platos: Plato[] = [];
  let categorias: string[] = [];
  let categoriaActiva = 'Todas';
  let cargando = true;
  let error: string | null = null;

  // Obtener los platos del menú
  onMount(async () => {
    try {
      // Simulando una llamada a la API
      // En producción, reemplazar con una llamada real a tu API
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular carga
      
      // Datos de ejemplo (reemplazar con datos reales de tu API)
      platos = [
        {
          id: 1,
          nombre: 'Ensalada César',
          descripcion: 'Lechuga romana, crutones, queso parmesano, aderezo césar',
          precio: 12.99,
          imagen: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
          categoria: 'Entradas'
        },
        {
          id: 2,
          nombre: 'Pasta Carbonara',
          descripcion: 'Pasta con salsa cremosa de huevo, queso, panceta y pimienta negra',
          precio: 15.99,
          imagen: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
          categoria: 'Platos Principales'
        },
        {
          id: 3,
          nombre: 'Tiramisú',
          descripcion: 'Postre italiano clásico con café y cacao en polvo',
          precio: 7.99,
          imagen: 'https://images.unsplash.com/photo-1579952365463-bf1d3e9b221e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
          categoria: 'Postres'
        },
        {
          id: 4,
          nombre: 'Parrillada de Verduras',
          descripcion: 'Verduras de temporada a la parrilla con aceite de oliva',
          precio: 13.99,
          imagen: 'https://images.unsplash.com/photo-1600891964098-1c4d9c7b1075?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
          categoria: 'Platos Principales'
        },
        {
          id: 5,
          nombre: 'Sopa del Día',
          descripcion: 'Sopa casera preparada diariamente con ingredientes frescos',
          precio: 8.99,
          imagen: 'https://images.unsplash.com/photo-1476224203421-9ca39b5b0226?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
          categoria: 'Entradas'
        },
        {
          id: 6,
          nombre: 'Flan Casero',
          descripcion: 'Tradicional postre de huevo con caramelo',
          precio: 6.99,
          imagen: 'https://images.unsplash.com/photo-1551218808-94e2082ba20d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
          categoria: 'Postres'
        }
      ];

      // Obtener categorías únicas
      categorias = ['Todas', ...new Set(platos.map(plato => plato.categoria))];
      
    } catch (err) {
      console.error('Error al cargar el menú:', err);
      error = 'No se pudo cargar el menú. Por favor, intente nuevamente.';
    } finally {
      cargando = false;
    }
  });

  // Filtrar platos por categoría
  $: platosFiltrados = categoriaActiva === 'Todas' 
    ? platos 
    : platos.filter(plato => plato.categoria === categoriaActiva);
</script>

<svelte:head>
  <title>Menú - Restaurante del Chef</title>
  <meta name="description" content="Descubre nuestra deliciosa selección de platos preparados con los mejores ingredientes." />
</svelte:head>

<!-- Hero Section -->
<div class="bg-amber-600 text-white py-20">
  <div class="container mx-auto px-6 text-center">
    <h1 class="text-4xl md:text-6xl font-bold mb-4">Nuestro Menú</h1>
    <p class="text-xl md:text-2xl max-w-3xl mx-auto">Disfruta de una experiencia culinaria excepcional con nuestros platos preparados con ingredientes frescos y de la más alta calidad.</p>
  </div>
</div>

<!-- Filtros de Categoría -->
<div class="bg-white shadow-sm sticky top-0 z-10">
  <div class="container mx-auto px-6 py-4 overflow-x-auto">
    <div class="flex space-x-2 md:space-x-4">
      {#each categorias as categoria}
        <button
          class="px-4 py-2 rounded-full whitespace-nowrap transition-colors {categoria === categoriaActiva 
            ? 'bg-amber-600 text-white' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}"
          on:click={() => categoriaActiva = categoria}
        >
          {categoria}
        </button>
      {/each}
    </div>
  </div>
</div>

<!-- Lista de Platos -->
<section class="py-12 bg-gray-50">
  <div class="container mx-auto px-6">
    {#if cargando}
      <div class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
        <p class="mt-4 text-gray-600">Cargando menú...</p>
      </div>
    {:else if error}
      <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-6" role="alert">
        <p>{error}</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each platosFiltrados as plato}
          <div class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
            <div class="h-48 overflow-hidden">
              <img 
                src={plato.imagen} 
                alt={plato.nombre} 
                class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div class="p-6">
              <div class="flex justify-between items-start">
                <h3 class="text-xl font-bold text-gray-900 mb-2">{plato.nombre}</h3>
                <span class="bg-amber-100 text-amber-800 text-sm font-semibold px-3 py-1 rounded-full">
                  ${plato.precio.toFixed(2)}
                </span>
              </div>
              <p class="text-gray-600 mb-4">{plato.descripcion}</p>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">{plato.categoria}</span>
                <button 
                  class="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-full transition-colors"
                  on:click={() => {
                    // Aquí iría la lógica para agregar al carrito
                    console.log('Añadir al carrito:', plato.nombre);
                  }}
                >
                  Añadir al carrito
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>

      {#if platosFiltrados.length === 0}
        <div class="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No hay platos en esta categoría</h3>
          <p class="mt-1 text-gray-500">Prueba con otra categoría o vuelve más tarde.</p>
          <button 
            class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            on:click={() => categoriaActiva = 'Todas'}
          >
            Ver todo el menú
          </button>
        </div>
      {/if}
    {/if}
  </div>
</section>

<!-- Sección de Bebidas -->
<section class="py-12 bg-white">
  <div class="container mx-auto px-6">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">Bebidas</h2>
      <div class="w-24 h-1 bg-amber-600 mx-auto"></div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Bebida 1 -->
      <div class="bg-gray-50 rounded-lg p-6 flex items-center space-x-4">
        <div class="flex-shrink-0">
          <div class="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900">Refrescos</h3>
          <p class="text-gray-600">Coca Cola, Sprite, Fanta, etc.</p>
          <p class="text-amber-600 font-semibold mt-1">$2.50</p>
        </div>
      </div>

      <!-- Bebida 2 -->
      <div class="bg-gray-50 rounded-lg p-6 flex items-center space-x-4">
        <div class="flex-shrink-0">
          <div class="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v-3.375c0-.621.503-1.125 1.125-1.125h2.25c.622 0 1.125.504 1.125 1.125V19.5m-6-7.5h6m-3-3h3m-3-3h6m-9 0v.75a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75V6.75a.75.75 0 01.75-.75h2.25a.75.75 0 01.75.75v.75m-3 0h6" />
            </svg>
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900">Agua Mineral</h3>
          <p class="text-gray-600">Con o sin gas</p>
          <p class="text-amber-600 font-semibold mt-1">$1.99</p>
        </div>
      </div>

      <!-- Bebida 3 -->
      <div class="bg-gray-50 rounded-lg p-6 flex items-center space-x-4">
        <div class="flex-shrink-0">
          <div class="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900">Jugos Naturales</h3>
          <p class="text-gray-600">Naranja, piña, maracuyá</p>
          <p class="text-amber-600 font-semibold mt-1">$3.50</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Llamada a la acción -->
<div class="bg-amber-700 text-white py-16">
  <div class="container mx-auto px-6 text-center">
    <h2 class="text-3xl font-bold mb-4">¿Listo para disfrutar de una deliciosa comida?</h2>
    <p class="text-xl mb-8 max-w-3xl mx-auto">Haz tu reserva ahora y disfruta de una experiencia culinaria inolvidable.</p>
    <a 
      href="/reservas" 
      class="inline-block bg-white text-amber-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-lg transition-colors"
    >
      Reservar Mesa
    </a>
  </div>
</div>

<style>
  /* Animaciones */
  .fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* Estilos para el scroll horizontal en móviles */
  .scroll-container {
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }
  
  .scroll-container::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
</style>
