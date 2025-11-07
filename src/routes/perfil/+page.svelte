<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  // Datos del usuario
  let user = $derived($page.data.user);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let activeTab = $state('perfil');
  
  // Datos del perfil
  let profile = $state({
    name: $page.data.user?.name || '',
    email: $page.data.user?.email || '',
    phone: ($page.data.user as any)?.phone || '',
    address: ($page.data.user as any)?.address || '',
  });
  
  // Pedidos recientes (ejemplo)
  let recentOrders = [
    { id: 1, date: '2023-11-05', total: 125.50, status: 'Completado' },
    { id: 2, date: '2023-11-01', total: 89.90, status: 'En camino' },
  ];
  
  // Verificar autenticación
  onMount(() => {
    if (!$page.data.user) {
      goto('/login?redirect=/perfil');
    } else {
      // Actualizar perfil cuando el usuario está disponible
      profile = {
        name: $page.data.user?.name || '',
        email: $page.data.user?.email || '',
        phone: ($page.data.user as any)?.phone || '',
        address: ($page.data.user as any)?.address || '',
      };
    }
  });
  
  // Función para guardar los cambios del perfil
  async function saveProfile(event: Event) {
    event.preventDefault();
    if (!$page.data.user) return;
    
    loading = true;
    error = null;
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile)
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el perfil');
      }
      
      // Actualizar datos del usuario
      // El servidor debería devolver el usuario actualizado
      const updatedUser = await response.json();
      $page.data.user = { ...$page.data.user, ...updatedUser };
      
      // Mostrar mensaje de éxito
      error = '¡Perfil actualizado correctamente!';
      setTimeout(() => error = null, 3000);
      
    } catch (err) {
      console.error('Error:', err);
      error = 'Error al actualizar el perfil. Inténtalo de nuevo.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-amber-50 py-8 px-4 sm:px-6 lg:px-8">
  <div class="max-w-4xl mx-auto">
    <!-- Encabezado -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-amber-900 font-serif">Mi Perfil</h1>
      <p class="mt-2 text-amber-700">Administra tu información personal y preferencias</p>
    </div>
    
    {#if error}
      <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
        <p>{error}</p>
      </div>
    {/if}
    
    <!-- Pestañas -->
    <div class="border-b border-amber-200 mb-8">
      <nav class="-mb-px flex space-x-8">
        <button 
          class="py-4 px-1 border-b-2 font-medium text-sm {activeTab === 'perfil' ? 'border-amber-500 text-amber-600' : 'border-transparent text-amber-500 hover:text-amber-700 hover:border-amber-300'}"
          onclick={() => activeTab = 'perfil'}
        >
          Perfil
        </button>
        <button 
          class="py-4 px-1 border-b-2 font-medium text-sm {activeTab === 'pedidos' ? 'border-amber-500 text-amber-600' : 'border-transparent text-amber-500 hover:text-amber-700 hover:border-amber-300'}"
          onclick={() => activeTab = 'pedidos'}
        >
          Mis Pedidos
        </button>
        <button 
          class="py-4 px-1 border-b-2 font-medium text-sm {activeTab === 'configuracion' ? 'border-amber-500 text-amber-600' : 'border-transparent text-amber-500 hover:text-amber-700 hover:border-amber-300'}"
          onclick={() => activeTab = 'configuracion'}
        >
          Configuración
        </button>
      </nav>
    </div>
    
    <!-- Contenido de las pestañas -->
    {#if activeTab === 'perfil'}
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 bg-amber-50">
          <h3 class="text-lg leading-6 font-medium text-amber-900">Información Personal</h3>
          <p class="mt-1 max-w-2xl text-sm text-amber-500">Actualiza tu información de contacto.</p>
        </div>
        <div class="border-t border-amber-200 px-4 py-5 sm:p-0">
          <form onsubmit={saveProfile} class="space-y-6 p-6">
            <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-3">
                <label for="name" class="block text-sm font-medium text-amber-700">Nombre completo</label>
                <input
                  type="text"
                  id="name"
                  bind:value={profile.name}
                  class="mt-1 block w-full border border-amber-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
              </div>
              
              <div class="sm:col-span-4">
                <label for="email" class="block text-sm font-medium text-amber-700">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  bind:value={profile.email}
                  disabled
                  class="mt-1 block w-full border border-amber-300 rounded-md shadow-sm py-2 px-3 bg-amber-50 sm:text-sm"
                />
                <p class="mt-1 text-xs text-amber-500">Contacta al soporte para cambiar tu correo electrónico</p>
              </div>
              
              <div class="sm:col-span-3">
                <label for="phone" class="block text-sm font-medium text-amber-700">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  bind:value={profile.phone}
                  class="mt-1 block w-full border border-amber-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  placeholder="+54 9 11 2345-6789"
                />
              </div>
              
              <div class="sm:col-span-6">
                <label for="address" class="block text-sm font-medium text-amber-700">Dirección</label>
                <input
                  type="text"
                  id="address"
                  bind:value={profile.address}
                  class="mt-1 block w-full border border-amber-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  placeholder="Calle, número, piso y departamento"
                />
              </div>
            </div>
            
            <div class="pt-5">
              <div class="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
    {:else if activeTab === 'pedidos'}
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 bg-amber-50">
          <h3 class="text-lg leading-6 font-medium text-amber-900">Mis Pedidos</h3>
          <p class="mt-1 max-w-2xl text-sm text-amber-500">Revisa el estado de tus pedidos recientes.</p>
        </div>
        
        <div class="bg-white shadow overflow-hidden sm:rounded-b-lg">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-amber-200">
              <thead class="bg-amber-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-amber-500 uppercase tracking-wider">Pedido #</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-amber-500 uppercase tracking-wider">Fecha</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-amber-500 uppercase tracking-wider">Total</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-amber-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-amber-200">
                {#each recentOrders as order}
                  <tr class="hover:bg-amber-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-900">
                      #{order.id}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-amber-500">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-amber-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {order.status}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href={`/pedidos/${order.id}`} class="text-amber-600 hover:text-amber-900">Ver detalle</a>
                    </td>
                  </tr>
                {:else}
                  <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-sm text-amber-500">
                      No hay pedidos recientes
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          
          <div class="px-6 py-4 bg-amber-50 border-t border-amber-200 flex items-center justify-between">
            <button class="text-sm font-medium text-amber-700 hover:text-amber-900">
              Ver historial completo →
            </button>
          </div>
        </div>
      </div>
      
    {:else if activeTab === 'configuracion'}
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 bg-amber-50">
          <h3 class="text-lg leading-6 font-medium text-amber-900">Configuración</h3>
          <p class="mt-1 max-w-2xl text-sm text-amber-500">Administra tus preferencias y notificaciones.</p>
        </div>
        
        <div class="px-4 py-5 sm:p-6 space-y-6">
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input
                id="notifications"
                name="notifications"
                type="checkbox"
                class="focus:ring-amber-500 h-4 w-4 text-amber-600 border-amber-300 rounded"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="notifications" class="font-medium text-amber-700">Recibir notificaciones por correo</label>
              <p class="text-amber-500">Recibirás actualizaciones sobre tus pedidos y promociones.</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input
                id="newsletter"
                name="newsletter"
                type="checkbox"
                class="focus:ring-amber-500 h-4 w-4 text-amber-600 border-amber-300 rounded"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="newsletter" class="font-medium text-amber-700">Suscribirse al boletín</label>
              <p class="text-amber-500">Recibe nuestras ofertas especiales y novedades.</p>
            </div>
          </div>
          
          <div class="pt-5">
            <div class="flex justify-end">
              <button
                type="button"
                class="bg-white py-2 px-4 border border-amber-300 rounded-md shadow-sm text-sm font-medium text-amber-700 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Guardar preferencias
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
