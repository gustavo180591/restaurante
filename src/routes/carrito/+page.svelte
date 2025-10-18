<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { cartStore, cartActions, cartItems, cartTotal, cartItemCount, cartIsEmpty } from '$lib/stores/cart';

  let loading = false;

  function formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(precio);
  }

  function updateQuantity(id: number, cantidad: number) {
    if (cantidad <= 0) {
      cartActions.removeItem(id);
    } else {
      cartActions.updateQuantity(id, cantidad);
    }
  }

  function updateNote(id: number, nota: string) {
    cartActions.updateNote(id, nota);
  }

  function removeItem(id: number) {
    cartActions.removeItem(id);
  }

  function clearCart() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      cartActions.clearCart();
    }
  }

  function proceedToCheckout() {
    goto('/checkout');
  }

  function continueShopping() {
    goto('/menu');
  }
</script>

<svelte:head>
  <title>Carrito de compras - Restaurante del Chef</title>
  <meta name="description" content="Revisa y gestiona los productos en tu carrito de compras antes de proceder al pago." />
</svelte:head>

<!-- Breadcrumb -->
<nav class="bg-gray-100 py-4">
  <div class="container mx-auto px-6">
    <div class="flex items-center space-x-2 text-sm text-gray-600">
      <a href="/" class="hover:text-amber-600 transition-colors">Inicio</a>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-gray-900 font-medium">Carrito de compras</span>
    </div>
  </div>
</nav>

<!-- Contenido Principal -->
<main class="min-h-screen bg-gray-50">
  <div class="container mx-auto px-6 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Carrito de compras</h1>
        <p class="text-gray-600">Revisa y gestiona los productos antes de proceder al pago</p>
      </div>

      {#if $cartIsEmpty}
        <!-- Carrito vacío -->
        <div class="text-center py-16">
          <div class="text-gray-400 mb-6">
            <svg class="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Tu carrito está vacío</h2>
          <p class="text-gray-600 mb-8 max-w-md mx-auto">
            Agrega algunos productos deliciosos para comenzar tu experiencia gastronómica
          </p>
          <a
            href="/menu"
            class="inline-block bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Explorar menú
          </a>
        </div>
      {:else}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Lista de productos -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
              <!-- Header del carrito -->
              <div class="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 class="text-lg font-semibold text-gray-900">
                  Productos en tu carrito ({$cartItemCount})
                </h2>
                <button
                  on:click={clearCart}
                  class="text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>

              <!-- Lista de items -->
              <div class="divide-y divide-gray-200">
                {#each $cartItems as item}
                  <div class="p-6">
                    <div class="flex items-start space-x-4">
                      <!-- Imagen del producto -->
                      <div class="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                        {#if item.foto}
                          <img
                            src={item.foto}
                            alt={item.nombre}
                            class="w-full h-full object-cover"
                          />
                        {:else}
                          <div class="w-full h-full flex items-center justify-center">
                            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        {/if}
                      </div>

                      <!-- Información del producto -->
                      <div class="flex-1 min-w-0">
                        <h3 class="text-lg font-medium text-gray-900 mb-1">{item.nombre}</h3>

                        {#if item.nota}
                          <p class="text-sm text-gray-600 mb-3">{item.nota}</p>
                        {/if}

                        <!-- Controles de cantidad y nota -->
                        <div class="space-y-3">
                          <!-- Cantidad -->
                          <div class="flex items-center space-x-3">
                            <span class="text-sm font-medium text-gray-700">Cantidad:</span>
                            <select
                              value={item.cantidad}
                              on:change={(e) => updateQuantity(item.id, parseInt((e.target as HTMLSelectElement).value))}
                              class="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                              {#each Array.from({ length: 10 }, (_, i) => i + 1) as qty}
                                <option value={qty}>{qty}</option>
                              {/each}
                            </select>
                          </div>

                          <!-- Nota especial -->
                          <div>
                            <label for="nota-{item.id}" class="block text-sm font-medium text-gray-700 mb-1">
                              Nota especial
                            </label>
                            <textarea
                              id="nota-{item.id}"
                              value={item.nota || ''}
                              on:input={(e) => updateNote(item.id, (e.target as HTMLTextAreaElement).value)}
                              placeholder="Ej: Sin cebolla, término medio, etc."
                              rows="2"
                              class="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                            ></textarea>
                          </div>
                        </div>
                      </div>

                      <!-- Precio y acciones -->
                      <div class="flex-shrink-0 text-right">
                        <div class="text-lg font-semibold text-gray-900 mb-2">
                          {formatearPrecio(item.precio * item.cantidad)}
                        </div>
                        <div class="text-sm text-gray-600 mb-4">
                          {formatearPrecio(item.precio)} c/u
                        </div>
                        <button
                          on:click={() => removeItem(item.id)}
                          class="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </div>

          <!-- Resumen del pedido -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Resumen del pedido</h3>

              <!-- Subtotal -->
              <div class="flex items-center justify-between mb-3">
                <span class="text-gray-600">Subtotal:</span>
                <span class="font-medium">{formatearPrecio($cartTotal)}</span>
              </div>

              <!-- Envío (por ahora gratuito) -->
              <div class="flex items-center justify-between mb-3">
                <span class="text-gray-600">Envío:</span>
                <span class="font-medium text-green-600">Gratis</span>
              </div>

              <!-- Divider -->
              <div class="border-t border-gray-200 my-4"></div>

              <!-- Total -->
              <div class="flex items-center justify-between mb-6">
                <span class="text-lg font-semibold text-gray-900">Total:</span>
                <span class="text-xl font-bold text-amber-600">{formatearPrecio($cartTotal)}</span>
              </div>

              <!-- Información adicional -->
              <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div class="flex items-start space-x-2">
                  <svg class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div class="text-sm text-amber-800">
                    <p class="font-medium mb-1">Tiempo de preparación</p>
                    <p>Los pedidos se preparan en aproximadamente 15-20 minutos</p>
                  </div>
                </div>
              </div>

              <!-- Botones de acción -->
              <div class="space-y-3">
                <button
                  on:click={proceedToCheckout}
                  class="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Proceder al pago
                </button>

                <button
                  on:click={continueShopping}
                  class="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Continuar comprando
                </button>
              </div>

              <!-- Métodos de pago aceptados -->
              <div class="mt-6 pt-6 border-t border-gray-200">
                <p class="text-sm font-medium text-gray-900 mb-3">Métodos de pago aceptados</p>
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-6 bg-blue-600 rounded text-white text-xs font-bold flex items-center justify-center">
                    VISA
                  </div>
                  <div class="w-8 h-6 bg-red-600 rounded text-white text-xs font-bold flex items-center justify-center">
                    MC
                  </div>
                  <div class="w-8 h-6 bg-blue-500 rounded text-white text-xs font-bold flex items-center justify-center">
                    AMEX
                  </div>
                  <div class="flex items-center space-x-1 text-gray-600 text-xs">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Efectivo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</main>

<style>
  /* Estilos adicionales para el carrito */
  .sticky {
    position: sticky;
  }

  @media (min-width: 1024px) {
    .sticky {
      top: 2rem;
    }
  }
</style>
