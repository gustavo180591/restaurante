<script lang="ts">
  import { cartStore, cartActions, cartItems, cartTotal, cartItemCount, cartIsEmpty } from '$lib/stores/cart';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(precio);
  }

  function toggleCart() {
    cartActions.toggleCart();
  }

  function closeCart() {
    cartActions.closeCart();
  }

  function goToCart() {
    closeCart();
    dispatch('navigate', { path: '/carrito' });
  }

  function removeItem(id: number) {
    cartActions.removeItem(id);
  }
</script>

<!-- Mini Cart Overlay -->
{#if $cartStore.isOpen}
  <div class="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="cart-title">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black bg-opacity-50" on:click={closeCart} role="button" tabindex="0" aria-label="Cerrar carrito" on:keydown={(e) => e.key === 'Escape' && closeCart()}></div>

    <!-- Cart Panel -->
    <div class="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 id="cart-title" class="text-lg font-semibold text-gray-900">
          Carrito de compras ({$cartItemCount})
        </h2>
        <button
          on:click={closeCart}
          class="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar carrito"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Cart Content -->
      <div class="flex-1 overflow-y-auto p-6">
        {#if $cartIsEmpty}
          <!-- Carrito vacío -->
          <div class="text-center py-12">
            <div class="text-gray-400 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Tu carrito está vacío</h3>
            <p class="text-gray-600 mb-6">Agrega algunos productos para comenzar</p>
            <button
              on:click={closeCart}
              class="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Continuar comprando
            </button>
          </div>
        {:else}
          <!-- Lista de productos -->
          <div class="space-y-4 mb-6">
            {#each $cartItems as item}
              <div class="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <!-- Imagen del producto -->
                <div class="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                  {#if item.foto}
                    <img
                      src={item.foto}
                      alt={item.nombre}
                      class="w-full h-full object-cover"
                    />
                  {:else}
                    <div class="w-full h-full flex items-center justify-center">
                      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  {/if}
                </div>

                <!-- Información del producto -->
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-gray-900 truncate">{item.nombre}</h4>

                  {#if item.nota}
                    <p class="text-xs text-gray-600 mt-1 line-clamp-2">{item.nota}</p>
                  {/if}

                  <div class="flex items-center justify-between mt-2">
                    <div class="flex items-center space-x-2">
                      <span class="text-sm text-gray-600">Cantidad:</span>
                      <select
                        value={item.cantidad}
                        on:change={(e) => cartActions.updateQuantity(item.id, parseInt((e.target as HTMLSelectElement).value))}
                        class="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        {#each Array.from({ length: 10 }, (_, i) => i + 1) as qty}
                          <option value={qty}>{qty}</option>
                        {/each}
                      </select>
                    </div>

                    <div class="text-right">
                      <div class="text-sm font-medium text-gray-900">
                        {formatearPrecio(item.precio * item.cantidad)}
                      </div>
                      <div class="text-xs text-gray-600">
                        {formatearPrecio(item.precio)} c/u
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Botón eliminar -->
                <button
                  on:click={() => removeItem(item.id)}
                  class="text-gray-400 hover:text-red-600 transition-colors p-1"
                  aria-label="Eliminar producto"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            {/each}
          </div>

          <!-- Resumen del carrito -->
          <div class="border-t border-gray-200 pt-6">
            <div class="flex items-center justify-between text-lg font-semibold text-gray-900 mb-4">
              <span>Total:</span>
              <span class="text-amber-600">{formatearPrecio($cartTotal)}</span>
            </div>

            <!-- Botones de acción -->
            <div class="space-y-3">
              <button
                on:click={goToCart}
                class="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Ir al carrito
              </button>

              <button
                on:click={closeCart}
                class="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Continuar comprando
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- Botón del carrito (para abrir el mini-cart) -->
<button
  on:click={toggleCart}
  class="relative bg-amber-600 hover:bg-amber-700 text-white p-3 rounded-full transition-colors shadow-lg hover:shadow-xl"
  aria-label="Ver carrito de compras"
>
  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
  </svg>

  {#if $cartItemCount > 0}
    <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
      {$cartItemCount}
    </span>
  {/if}
</button>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
