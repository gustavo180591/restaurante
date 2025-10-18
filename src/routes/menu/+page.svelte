<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { cartActions } from '$lib/stores/cart';

  interface Producto {
    id: number;
    nombre: string;
    descripcion?: string;
    precio: number;
    foto?: {
      id: number;
      ruta: string;
    };
    tipos: Array<{
      id: number;
      nombre: string;
    }>;
    especialidades: Array<{
      id: number;
      nombre: string;
    }>;
    disponible: boolean;
  }

  interface Filtros {
    tipos: Array<{
      id: number;
      nombre: string;
    }>;
    especialidades: Array<{
      id: number;
      nombre: string;
    }>;
  }

  interface Paginacion {
    pagina: number;
    limite: number;
    total: number;
    paginas: number;
  }

  interface CatalogoResponse {
    productos: Producto[];
    filtros: Filtros;
    paginacion: Paginacion;
  }

  let productos: Producto[] = [];
  let filtros: Filtros = { tipos: [], especialidades: [] };
  let paginacion: Paginacion = {
    pagina: 1,
    limite: 12,
    total: 0,
    paginas: 0
  };

  let loading = false;
  let error: string | null = null;

  // Filtros activos
  let searchQuery = '';
  let selectedTipo: number | null = null;
  let selectedEspecialidad: number | null = null;
  let orderBy = 'nombre';
  let order = 'asc';
  let minPrice = '';
  let maxPrice = '';

  // Estado del sidebar de filtros
  let showFilters = false;

  // Estado para agregar al carrito
  let addingToCart = new Set<number>();

  // Cargar productos
  async function cargarProductos() {
    if (loading) return;

    loading = true;
    error = null;

    try {
      const params = new URLSearchParams({
        page: paginacion.pagina.toString(),
        limit: paginacion.limite.toString(),
        orderBy,
        order
      });

      if (searchQuery) params.set('search', searchQuery);
      if (selectedTipo) params.set('tipo', selectedTipo.toString());
      if (selectedEspecialidad) params.set('especialidad', selectedEspecialidad.toString());
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);

      const response = await fetch(`/api/platos?${params}`);
      const data: CatalogoResponse = await response.json();

      productos = data.productos;
      filtros = data.filtros;
      paginacion = data.paginacion;

    } catch (err) {
      console.error('Error al cargar productos:', err);
      error = 'Error al cargar el catálogo de productos';
    } finally {
      loading = false;
    }
  }

  // Aplicar filtros
  function aplicarFiltros() {
    paginacion.pagina = 1; // Reset a primera página
    showFilters = false;
    cargarProductos();
  }

  // Limpiar filtros
  function limpiarFiltros() {
    searchQuery = '';
    selectedTipo = null;
    selectedEspecialidad = null;
    minPrice = '';
    maxPrice = '';
    orderBy = 'nombre';
    order = 'asc';
    aplicarFiltros();
  }

  // Cambiar página
  function cambiarPagina(nuevaPagina: number) {
    paginacion.pagina = nuevaPagina;
    cargarProductos();
  }

  // Cambiar ordenamiento
  function cambiarOrden(campo: string) {
    if (orderBy === campo) {
      order = order === 'asc' ? 'desc' : 'asc';
    } else {
      orderBy = campo;
      order = 'asc';
    }
    paginacion.pagina = 1;
    cargarProductos();
  }

  // Formatear precio
  function formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(precio);
  }

  // Agregar al carrito
  async function agregarAlCarrito(producto: Producto) {
    if (!producto.disponible) return;

    addingToCart.add(producto.id);

    // Simular un pequeño delay para mostrar el estado de carga
    await new Promise(resolve => setTimeout(resolve, 500));

    cartActions.addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      foto: producto.foto?.ruta,
      disponible: producto.disponible
    }, 1);

    addingToCart.delete(producto.id);

    // Mostrar confirmación breve
    // Podríamos usar un toast aquí en el futuro
  }

  // Cargar productos al montar el componente
  onMount(() => {
    if (browser) {
      cargarProductos();
    }
  });

  // Recargar cuando cambian los filtros principales
  $: {
    if (searchQuery || selectedTipo || selectedEspecialidad || minPrice || maxPrice) {
      if (browser) {
        const timeoutId = setTimeout(() => {
          aplicarFiltros();
        }, 500);
        // No necesitamos cleanup aquí ya que Svelte maneja la reactividad
      }
    }
  }
</script>

<svelte:head>
  <title>Menú - Restaurante del Chef</title>
  <meta name="description" content="Explora nuestro delicioso menú con platos tradicionales e innovadores preparados con ingredientes frescos de primera calidad." />
</svelte:head>

<!-- Hero Section -->
<section class="relative bg-gradient-to-r from-amber-600 to-orange-600 text-white py-20">
  <div class="container mx-auto px-6 text-center">
    <h1 class="text-4xl md:text-6xl font-bold mb-6">Nuestro Menú</h1>
    <p class="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
      Descubre nuestra selección de platos preparados con ingredientes frescos y técnicas tradicionales
    </p>

    <!-- Barra de búsqueda -->
    <div class="max-w-2xl mx-auto">
      <div class="relative">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Buscar platos..."
          class="w-full px-6 py-4 text-lg text-gray-900 bg-white rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-300"
        />
        <button
          class="absolute right-3 top-1/2 transform -translate-y-1/2 bg-amber-600 hover:bg-amber-700 p-2 rounded-full transition duration-300"
          on:click={aplicarFiltros}
          aria-label="Buscar productos"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</section>

<!-- Contenido Principal -->
<main class="min-h-screen bg-gray-50">
  <div class="container mx-auto px-6 py-12">
    <!-- Controles del catálogo -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
      <!-- Resultados y ordenamiento -->
      <div class="flex items-center gap-4">
        <p class="text-gray-600">
          {#if productos.length > 0}
            Mostrando {((paginacion.pagina - 1) * paginacion.limite) + 1}-{Math.min(paginacion.pagina * paginacion.limite, paginacion.total)} de {paginacion.total} productos
          {:else}
            No se encontraron productos
          {/if}
        </p>

        <!-- Botón filtros móviles -->
        <button
          class="lg:hidden bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          on:click={() => showFilters = !showFilters}
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
        </button>
      </div>

      <!-- Ordenamiento -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">Ordenar por:</span>
        <select
          bind:value={orderBy}
          on:change={() => cambiarOrden(orderBy)}
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="nombre">Nombre</option>
          <option value="precio">Precio</option>
          <option value="createdAt">Más reciente</option>
        </select>

        <button
          on:click={() => cambiarOrden(orderBy)}
          class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          aria-label="Cambiar orden"
        >
          <svg class="w-5 h-5 transform transition-transform {order === 'desc' ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>
    </div>

    <div class="flex gap-8">
      <!-- Sidebar de filtros -->
      <aside class="w-80 flex-shrink-0 {showFilters ? 'block' : 'hidden lg:block'}">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Filtros</h3>
            <button
              on:click={limpiarFiltros}
              class="text-sm text-amber-600 hover:text-amber-700"
            >
              Limpiar todo
            </button>
          </div>

          <!-- Filtro por tipo de plato -->
          <div class="mb-6">
            <h4 class="font-medium text-gray-900 mb-3">Tipo de Plato</h4>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  type="radio"
                  bind:group={selectedTipo}
                  value={null}
                  class="mr-2 text-amber-600 focus:ring-amber-500"
                />
                <span class="text-sm text-gray-700">Todos</span>
              </label>
              {#each filtros.tipos as tipo}
                <label class="flex items-center">
                  <input
                    type="radio"
                    bind:group={selectedTipo}
                    value={tipo.id}
                    class="mr-2 text-amber-600 focus:ring-amber-500"
                  />
                  <span class="text-sm text-gray-700">{tipo.nombre}</span>
                </label>
              {/each}
            </div>
          </div>

          <!-- Filtro por especialidad -->
          <div class="mb-6">
            <h4 class="font-medium text-gray-900 mb-3">Especialidad</h4>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  type="radio"
                  bind:group={selectedEspecialidad}
                  value={null}
                  class="mr-2 text-amber-600 focus:ring-amber-500"
                />
                <span class="text-sm text-gray-700">Todas</span>
              </label>
              {#each filtros.especialidades as especialidad}
                <label class="flex items-center">
                  <input
                    type="radio"
                    bind:group={selectedEspecialidad}
                    value={especialidad.id}
                    class="mr-2 text-amber-600 focus:ring-amber-500"
                  />
                  <span class="text-sm text-gray-700">{especialidad.nombre}</span>
                </label>
              {/each}
            </div>
          </div>

          <!-- Filtro por precio -->
          <div class="mb-6">
            <h4 class="font-medium text-gray-900 mb-3">Precio</h4>
            <div class="grid grid-cols-2 gap-2">
              <input
                type="number"
                bind:value={minPrice}
                placeholder="Mín"
                class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                step="0.01"
                min="0"
              />
              <input
                type="number"
                bind:value={maxPrice}
                placeholder="Máx"
                class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <!-- Botón aplicar filtros -->
          <button
            on:click={aplicarFiltros}
            class="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300"
          >
            Aplicar Filtros
          </button>
        </div>
      </aside>

      <!-- Grid de productos -->
      <div class="flex-1">
        {#if loading}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each Array(6) as _}
              <div class="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div class="w-full h-48 bg-gray-300 rounded-lg mb-4"></div>
                <div class="h-4 bg-gray-300 rounded mb-2"></div>
                <div class="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div class="h-6 bg-gray-300 rounded w-1/4"></div>
              </div>
            {/each}
          </div>
        {:else if error}
          <div class="text-center py-12">
            <div class="text-red-600 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Error al cargar productos</h3>
            <p class="text-gray-600">{error}</p>
          </div>
        {:else if productos.length === 0}
          <div class="text-center py-12">
            <div class="text-gray-400 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
            <p class="text-gray-600">Intenta ajustar los filtros o términos de búsqueda</p>
          </div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each productos as producto}
              <a href="/producto/{producto.id}" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                <!-- Imagen del producto -->
                <div class="relative h-48 overflow-hidden">
                  {#if producto.foto}
                    <img
                      src={producto.foto.ruta}
                      alt={producto.nombre}
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  {:else}
                    <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  {/if}

                  {#if !producto.disponible}
                    <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span class="text-white font-semibold text-lg">No disponible</span>
                    </div>
                  {/if}

                  <!-- Overlay con botón -->
                  <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span class="bg-white text-gray-900 px-4 py-2 rounded-full font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      Ver detalles
                    </span>
                  </div>
                </div>

                <!-- Información del producto -->
                <div class="p-6">
                  <h3 class="text-xl font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors line-clamp-1">{producto.nombre}</h3>

                  {#if producto.descripcion}
                    <p class="text-gray-600 text-sm mb-3 line-clamp-2">{producto.descripcion}</p>
                  {/if}

                  <!-- Tipos y especialidades -->
                  <div class="flex flex-wrap gap-2 mb-4">
                    {#each producto.tipos.slice(0, 2) as tipo}
                      <span class="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                        {tipo.nombre}
                      </span>
                    {/each}
                    {#if producto.especialidades.length > 0}
                      <span class="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                        {producto.especialidades[0].nombre}
                      </span>
                    {/if}
                  </div>

                  <!-- Precio -->
                  <div class="flex items-center justify-between">
                    <span class="text-2xl font-bold text-amber-600">
                      {formatearPrecio(producto.precio)}
                    </span>

                    <button
                      on:click={() => agregarAlCarrito(producto)}
                      disabled={!producto.disponible || addingToCart.has(producto.id)}
                      class="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-300 flex items-center gap-2"
                    >
                      {#if addingToCart.has(producto.id)}
                        <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      {:else}
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      {/if}
                      {#if producto.disponible}
                        Agregar
                      {:else}
                        No disponible
                      {/if}
                    </button>
                  </div>
                </div>
              </a>
            {/each}
          </div>

          <!-- Paginación -->
          {#if paginacion.paginas > 1}
            <div class="mt-12 flex justify-center">
              <div class="flex items-center space-x-2">
                <button
                  on:click={() => cambiarPagina(paginacion.pagina - 1)}
                  disabled={paginacion.pagina <= 1}
                  class="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>

                {#each Array.from({ length: Math.min(5, paginacion.paginas) }, (_, i) => {
                  const pageNum = Math.max(1, paginacion.pagina - 2) + i;
                  return pageNum <= paginacion.paginas ? pageNum : null;
                }).filter((pageNum): pageNum is number => pageNum !== null) as pageNum}
                  <button
                    on:click={() => cambiarPagina(pageNum)}
                    class="px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 {paginacion.pagina === pageNum
                      ? 'bg-amber-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'}"
                  >
                    {pageNum}
                  </button>
                {/each}

                <button
                  on:click={() => cambiarPagina(paginacion.pagina + 1)}
                  disabled={paginacion.pagina >= paginacion.paginas}
                  class="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </div>
</main>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
