<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    
    // Obtener el usuario de la sesión
    let user = $derived($page.data.user);
    
    // Estado para controlar la visibilidad del menú
    let isOpen = $state(false);
    
    // Función para alternar la visibilidad del menú
    function toggleMenu() {
        isOpen = !isOpen;
    }
    
    // Función para cerrar el menú
    function closeMenu() {
        isOpen = false;
    }
    
    // Función para cerrar sesión
    async function logout() {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Forzar una recarga de la página para actualizar el estado de autenticación
                window.location.href = '/';
            } else {
                console.error('Error al cerrar sesión');
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    }
    
    // Función para obtener las iniciales del usuario
    function getInitials(name: string, email: string): string {
        if (name) {
            return name
                .split(' ')
                .map(part => part[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
        }
        return email ? email.substring(0, 2).toUpperCase() : 'US';
    }
</script>

<div class="relative">
    <!-- Botón del perfil -->
    <button
        onclick={toggleMenu}
        onkeydown={(e) => e.key === 'Enter' && toggleMenu()}
        class="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Menú de usuario"
    >
        {#if user?.name || user?.email}
            <span class="text-sm">{getInitials(user.name || '', user.email || '')}</span>
        {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
        {/if}
    </button>

    <!-- Menú desplegable -->
    {#if isOpen}
        <div 
            class="absolute right-0 z-50 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
            tabindex="-1"
            onclick={(e) => e.target === e.currentTarget && closeMenu()}
            onkeydown={(e) => e.key === 'Escape' && closeMenu()}
        >
            <div class="px-4 py-3 border-b border-gray-100">
                <p class="text-sm text-gray-900 font-medium truncate">
                    {user?.name || 'Usuario'}
                </p>
                <p class="text-xs text-gray-500 truncate">
                    {user?.email || ''}
                </p>
            </div>
            
            <div class="py-1" role="none">
                <a 
                    href="/perfil" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    tabindex="-1"
                    onclick={closeMenu}
                >
                    Mi Perfil
                </a>
                <a 
                    href="/pedidos" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    tabindex="-1"
                    onclick={closeMenu}
                >
                    Mis Pedidos
                </a>
                <a 
                    href="/configuracion" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    tabindex="-1"
                    onclick={closeMenu}
                >
                    Configuración
                </a>
            </div>
            
            <div class="py-1 border-t border-gray-100" role="none">
                <button
                    onclick={logout}
                    class="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                    role="menuitem"
                    tabindex="-1"
                >
                    Cerrar sesión
                </button>
            </div>
        </div>
    {/if}
</div>

<!-- Overlay para cerrar el menú al hacer clic fuera -->
{#if isOpen}
    <div 
        class="fixed inset-0 z-40"
        onclick={closeMenu}
        role="presentation"
        tabindex="-1"
    ></div>
{/if}

<style>
    /* Animation styles removed as they were unused */
</style>
