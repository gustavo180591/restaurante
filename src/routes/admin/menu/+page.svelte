<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  interface Menu {
    id: number;
    nombre: string;
    descripcion?: string;
    activo: boolean;
    fechaCreacion: string;
  }

  let menus: Menu[] = [];
  let loading = true;
  let error = '';
  let searchTerm = '';
  let showInactive = false;

  onMount(async () => {
    await loadMenus();
  });

  async function loadMenus() {
    try {
      loading = true;
      const response = await fetch('/api/menu');
      if (!response.ok) {
        throw new Error('Error al cargar los menús');
      }
      menus = await response.json();
    } catch (err: any) {
      error = err.message || 'Error desconocido';
    } finally {
      loading = false;
    }
  }

  function filteredMenus() {
    return menus.filter(menu => {
      const matchesSearch = menu.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (menu.descripcion && menu.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = showInactive || menu.activo;
      return matchesSearch && matchesStatus;
    });
  }

  async function toggleMenuStatus(menu: Menu) {
    try {
      const response = await fetch(`/api/menu/${menu.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activo: !menu.activo }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el menú');
      }

      await loadMenus(); // Recargar la lista
    } catch (err: any) {
      error = err.message || 'Error al actualizar el menú';
    }
  }

  function editMenu(menu: Menu) {
    goto(`/admin/menu/${menu.id}/editar`);
  }

  function createNewMenu() {
    goto('/admin/menu/nuevo');
  }
</script>

<svelte:head>
  <title>Gestión de Menús - Restaurante</title>
</svelte:head>

<div class="menu-management">
  <header class="header">
    <h1>Gestión de Menús</h1>
    <button on:click={createNewMenu} class="create-btn">+ Nuevo Menú</button>
  </header>

  <div class="filters">
    <div class="search-box">
      <input
        type="text"
        placeholder="Buscar menús..."
        bind:value={searchTerm}
      />
    </div>
    <label>
      <input type="checkbox" bind:checked={showInactive} />
      Mostrar menús inactivos
    </label>
  </div>

  {#if loading}
    <div class="loading">
      <p>Cargando menús...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button on:click={loadMenus}>Reintentar</button>
    </div>
  {:else}
    <div class="menu-grid">
      {#each filteredMenus() as menu (menu.id)}
        <div class="menu-card" class:active={menu.activo}>
          <div class="menu-header">
            <h3>{menu.nombre}</h3>
            <span class="status-badge" class:active={menu.activo}>
              {menu.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          {#if menu.descripcion}
            <p class="menu-description">{menu.descripcion}</p>
          {/if}

          <div class="menu-meta">
            <small>Creado: {new Date(menu.fechaCreacion).toLocaleDateString()}</small>
          </div>

          <div class="menu-actions">
            <button on:click={() => editMenu(menu)} class="edit-btn">Editar</button>
            <button on:click={() => toggleMenuStatus(menu)} class="toggle-btn">
              {menu.activo ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        </div>
      {/each}
    </div>

    {#if filteredMenus().length === 0}
      <div class="empty-state">
        <p>No se encontraron menús.</p>
        <button on:click={createNewMenu}>Crear el primer menú</button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .menu-management {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .header h1 {
    margin: 0;
    color: #2d3748;
  }

  .create-btn {
    padding: 0.75rem 1.5rem;
    background-color: #4299e1;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;
  }

  .create-btn:hover {
    background-color: #3182ce;
  }

  .filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    align-items: center;
  }

  .search-box input {
    padding: 0.5rem;
    border: 1px solid #cbd5e0;
    border-radius: 4px;
    width: 300px;
  }

  .loading, .error, .empty-state {
    text-align: center;
    padding: 2rem;
  }

  .error button, .empty-state button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: #4299e1;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .menu-card {
    background-color: #fff;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .menu-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .menu-card.active {
    border-left: 4px solid #48bb78;
  }

  .menu-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .menu-header h3 {
    margin: 0;
    color: #2d3748;
  }

  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: bold;
    text-transform: uppercase;
  }

  .status-badge.active {
    background-color: #c6f6d5;
    color: #22543d;
  }

  .status-badge:not(.active) {
    background-color: #fed7d7;
    color: #c53030;
  }

  .menu-description {
    color: #4a5568;
    margin: 0 0 1rem 0;
    line-height: 1.5;
  }

  .menu-meta {
    margin-bottom: 1.5rem;
  }

  .menu-meta small {
    color: #a0aec0;
  }

  .menu-actions {
    display: flex;
    gap: 0.5rem;
  }

  .edit-btn, .toggle-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background-color 0.3s;
  }

  .edit-btn {
    background-color: #edf2f7;
    color: #4a5568;
  }

  .edit-btn:hover {
    background-color: #e2e8f0;
  }

  .toggle-btn {
    background-color: #48bb78;
    color: white;
  }

  .toggle-btn:hover {
    background-color: #38a169;
  }

  @media (max-width: 768px) {
    .menu-management {
      padding: 1rem;
    }

    .header {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .filters {
      flex-direction: column;
      align-items: stretch;
    }

    .search-box input {
      width: 100%;
    }

    .menu-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
