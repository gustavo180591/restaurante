<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
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
    turnos: Array<{
      id: number;
      nombre: string;
      horaInicio: string;
      horaFin: string;
      descripcion?: string;
    }>;
    disponible: boolean;
  }

  interface ProductoRelacionado {
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

  interface ProductoResponse {
    producto: Producto;
    relacionados: ProductoRelacionado[];
  }

  let producto: Producto | null = null;
  let productosRelacionados: ProductoRelacionado[] = [];
  let loading = true;
  let error: string | null = null;

  // Galería de imágenes
  let imagenActual = 0;
  let imagenes: string[] = [];

  // Estado del carrito
  let cantidad = 1;
  let notaEspecial = '';

  // Cargar producto
  async function cargarProducto() {
    if (!browser) return;

    const productoId = $page.params.id;

    if (!productoId) {
      error = 'ID de producto no válido';
      loading = false;
      return;
    }

    loading = true;
    error = null;

    try {
      const response = await fetch(`/api/platos/${productoId}`);
      const data: ProductoResponse = await response.json();

      producto = data.producto;
      productosRelacionados = data.relacionados;

      // Preparar galería de imágenes
      if (producto.foto) {
        imagenes = [producto.foto.ruta];
      }

      // Establecer imagen actual
      imagenActual = 0;

    } catch (err) {
      console.error('Error al cargar producto:', err);
      error = 'Error al cargar el producto';
    } finally {
      loading = false;
    }
  }

  // Cambiar imagen de la galería
  function cambiarImagen(indice: number) {
    imagenActual = indice;
  }

  // Siguiente imagen
  function siguienteImagen() {
    if (imagenActual < imagenes.length - 1) {
      imagenActual++;
    }
  }

  // Imagen anterior
  function anteriorImagen() {
    if (imagenActual > 0) {
      imagenActual--;
    }
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
  function agregarAlCarrito() {
    if (!producto) return;

    cartActions.addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      foto: producto.foto?.ruta,
      disponible: producto.disponible
    }, cantidad, notaEspecial);

    // Reset formulario
    cantidad = 1;
    notaEspecial = '';

    // Mostrar confirmación
    alert(`¡${producto.nombre} agregado al carrito!\nCantidad: ${cantidad}\nNota: ${notaEspecial || 'Sin nota'}`);
  }

  // Cargar producto al montar el componente
  onMount(() => {
    cargarProducto();
  });

  // Recargar cuando cambia el ID del producto
  $: if ($page.params.id && browser) {
    cargarProducto();
  }
</script>

<svelte:head>
  <title>{producto ? `${producto.nombre} - Restaurante del Chef` : 'Producto - Restaurante del Chef'}</title>
  <meta name="description" content={producto?.descripcion || 'Descubre nuestro delicioso plato preparado con ingredientes frescos de primera calidad.'} />
</svelte:head>

<!-- Breadcrumb -->
<nav class="bg-gray-100 py-4">
  <div class="container mx-auto px-6">
    <div class="flex items-center space-x-2 text-sm text-gray-600">
      <a href="/" class="hover:text-amber-600 transition-colors">Inicio</a>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <a href="/menu" class="hover:text-amber-600 transition-colors">Menú</a>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-gray-900 font-medium">{producto?.nombre || 'Producto'}</span>
    </div>
  </div>
</nav>

<!-- Contenido Principal -->
<main class="min-h-screen bg-gray-50">
  <div class="container mx-auto px-6 py-8">
    {#if loading}
      <!-- Loading skeleton -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div class="space-y-4">
          <div class="w-full h-96 bg-gray-300 rounded-lg animate-pulse"></div>
          <div class="flex space-x-2">
            <div class="w-20 h-20 bg-gray-300 rounded-lg animate-pulse"></div>
            <div class="w-20 h-20 bg-gray-300 rounded-lg animate-pulse"></div>
            <div class="w-20 h-20 bg-gray-300 rounded-lg animate-pulse"></div>
          </div>
        </div>
        <div class="space-y-6">
          <div class="h-8 bg-gray-300 rounded animate-pulse"></div>
          <div class="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
          <div class="h-6 bg-gray-300 rounded animate-pulse w-1/4"></div>
          <div class="space-y-3">
            <div class="h-4 bg-gray-300 rounded animate-pulse"></div>
            <div class="h-4 bg-gray-300 rounded animate-pulse"></div>
            <div class="h-4 bg-gray-300 rounded animate-pulse w-2/3"></div>
          </div>
          <div class="h-12 bg-gray-300 rounded-lg animate-pulse"></div>
        </div>
      </div>
    {:else if error}
      <!-- Error state -->
      <div class="text-center py-12">
        <div class="text-red-600 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Error al cargar producto</h3>
        <p class="text-gray-600">{error}</p>
        <a href="/menu" class="mt-4 inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition-colors">
          Volver al menú
        </a>
      </div>
    {:else if producto}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Galería de imágenes -->
        <div class="space-y-4">
          <!-- Imagen principal -->
          <div class="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            {#if imagenes.length > 0}
              <img
                src={imagenes[imagenActual]}
                alt={producto.nombre}
                class="w-full h-full object-cover"
              />
            {:else}
              <div class="w-full h-full flex items-center justify-center">
                <svg class="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            {/if}

            <!-- Controles de navegación -->
            {#if imagenes.length > 1}
              <button
                on:click={anteriorImagen}
                disabled={imagenActual === 0}
                class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Imagen anterior"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                on:click={siguienteImagen}
                disabled={imagenActual === imagenes.length - 1}
                class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Imagen siguiente"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            {/if}
          </div>

          <!-- Miniaturas -->
          {#if imagenes.length > 1}
            <div class="flex space-x-2 overflow-x-auto pb-2">
              {#each imagenes as imagen, indice}
                <button
                  on:click={() => cambiarImagen(indice)}
                  class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors {imagenActual === indice ? 'border-amber-500' : 'border-gray-200 hover:border-gray-300'}"
                >
                  <img
                    src={imagen}
                    alt={`${producto.nombre} - Vista ${indice + 1}`}
                    class="w-full h-full object-cover"
                  />
                </button>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Información del producto -->
        <div class="space-y-6">
          <!-- Encabezado -->
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{producto.nombre}</h1>

            <!-- Categorías y etiquetas -->
            <div class="flex flex-wrap gap-2 mb-4">
              {#each producto.tipos as tipo}
                <span class="inline-block bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full">
                  {tipo.nombre}
                </span>
              {/each}
              {#each producto.especialidades as especialidad}
                <span class="inline-block bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full">
                  {especialidad.nombre}
                </span>
              {/each}
            </div>

            <!-- Precio y disponibilidad -->
            <div class="flex items-center justify-between">
              <span class="text-4xl font-bold text-amber-600">
                {formatearPrecio(producto.precio)}
              </span>
              {#if !producto.disponible}
                <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  No disponible
                </span>
              {:else}
                <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Disponible
                </span>
              {/if}
            </div>
          </div>

          <!-- Descripción -->
          {#if producto.descripcion}
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
              <p class="text-gray-700 leading-relaxed">{producto.descripcion}</p>
            </div>
          {/if}

          <!-- Información adicional -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Tipos de plato -->
            {#if producto.tipos.length > 0}
              <div>
                <h4 class="font-medium text-gray-900 mb-2">Categorías</h4>
                <div class="space-y-1">
                  {#each producto.tipos as tipo}
                    <div class="text-sm text-gray-600">• {tipo.nombre}</div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Especialidades -->
            {#if producto.especialidades.length > 0}
              <div>
                <h4 class="font-medium text-gray-900 mb-2">Especialidades</h4>
                <div class="space-y-1">
                  {#each producto.especialidades as especialidad}
                    <div class="text-sm text-gray-600">• {especialidad.nombre}</div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>

          <!-- Horarios disponibles -->
          {#if producto.turnos.length > 0}
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Horarios disponibles</h4>
              <div class="grid grid-cols-1 gap-2">
                {#each producto.turnos as turno}
                  <div class="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <div class="font-medium text-gray-900">{turno.nombre}</div>
                      {#if turno.descripcion}
                        <div class="text-sm text-gray-600">{turno.descripcion}</div>
                      {/if}
                    </div>
                    <div class="text-sm text-gray-600">
                      {turno.horaInicio.slice(0, 5)} - {turno.horaFin.slice(0, 5)}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Formulario de pedido -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <h4 class="font-medium text-gray-900 mb-4">Hacer pedido</h4>

            <div class="space-y-4">
              <!-- Cantidad -->
              <div>
                <label for="cantidad" class="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <select
                  id="cantidad"
                  bind:value={cantidad}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  disabled={!producto.disponible}
                >
                  {#each Array.from({ length: 10 }, (_, i) => i + 1) as num}
                    <option value={num}>{num}</option>
                  {/each}
                </select>
              </div>

              <!-- Nota especial -->
              <div>
                <label for="nota" class="block text-sm font-medium text-gray-700 mb-1">
                  Nota especial (opcional)
                </label>
                <textarea
                  id="nota"
                  bind:value={notaEspecial}
                  placeholder="Ej: Sin cebolla, término medio, etc."
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  disabled={!producto.disponible}
                ></textarea>
              </div>

              <!-- Botón agregar al carrito -->
              <button
                on:click={agregarAlCarrito}
                disabled={!producto.disponible}
                class="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {#if producto.disponible}
                  Agregar al carrito - {formatearPrecio(producto.precio * cantidad)}
                {:else}
                  No disponible
                {/if}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Productos relacionados -->
      {#if productosRelacionados.length > 0}
        <section class="mt-16">
          <h2 class="text-2xl font-bold text-gray-900 mb-8">Productos relacionados</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {#each productosRelacionados as relacionado}
              <a
                href={`/producto/${relacionado.id}`}
                class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <!-- Imagen -->
                <div class="relative h-48 overflow-hidden">
                  {#if relacionado.foto}
                    <img
                      src={relacionado.foto.ruta}
                      alt={relacionado.nombre}
                      class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  {:else}
                    <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  {/if}
                </div>

                <!-- Información -->
                <div class="p-4">
                  <h3 class="font-semibold text-gray-900 mb-1 line-clamp-1">{relacionado.nombre}</h3>

                  <!-- Categorías -->
                  <div class="flex flex-wrap gap-1 mb-3">
                    {#each relacionado.tipos.slice(0, 2) as tipo}
                      <span class="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        {tipo.nombre}
                      </span>
                    {/each}
                  </div>

                  <!-- Precio y disponibilidad -->
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-amber-600">
                      {formatearPrecio(relacionado.precio)}
                    </span>
                    {#if !relacionado.disponible}
                      <span class="text-xs text-red-600">No disponible</span>
                    {/if}
                  </div>
                </div>
              </a>
            {/each}
          </div>
        </section>
      {/if}
    {:else}
      <!-- Producto no encontrado -->
      <div class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Producto no encontrado</h3>
        <p class="text-gray-600 mb-6">El producto que buscas no existe o no está disponible.</p>
        <a href="/menu" class="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition-colors">
          Ver menú completo
        </a>
      </div>
    {/if}
  </div>
</main>

<style>
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 1;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 2;
  }
</style>
