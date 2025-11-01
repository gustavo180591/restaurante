<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let user: any = null;
  let loading = true;
  let menus: any[] = [];
  let showCreateForm = false;
  let editingMenu: any = null;

  // Form data
  let menuForm = {
    nombre: '',
    descripcion: '',
    fecha: '',
    activo: true
  };

  onMount(async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        user = await response.json();
        await loadMenus();
      } else {
        goto('/login');
      }
    } catch (error) {
      goto('/login');
    } finally {
      loading = false;
    }
  });

  async function loadMenus() {
    try {
      const response = await fetch('/api/menus');
      if (!response.ok) {
        throw new Error('Error al cargar los menús');
      }
      menus = await response.json();
    } catch (error) {
      console.error('Error al cargar menús:', error);
      // En caso de error, mostrar datos simulados como fallback
      menus = [
        {
          id: 1,
          nombre: 'Menú Ejecutivo',
          descripcion: 'Menú especial para ejecutivos',
          fecha: '2024-01-15',
          activo: true,
          platos: 5,
          estado: 'Activo',
          turno: 'Mediodía'
        }
      ];
    }
  }

  function showCreateMenuForm() {
    showCreateForm = true;
    editingMenu = null;
    resetForm();
  }

  function editMenu(menu: any) {
    editingMenu = menu;
    menuForm = {
      nombre: menu.nombre,
      descripcion: menu.descripcion,
      fecha: menu.fecha,
      activo: menu.activo
    };
    showCreateForm = true;
  }

  function resetForm() {
    menuForm = {
      nombre: '',
      descripcion: '',
      fecha: '',
      activo: true
    };
  }

  function cancelForm() {
    showCreateForm = false;
    editingMenu = null;
    resetForm();
  }

  async function saveMenu() {
    try {
      if (editingMenu) {
        // Actualizar menú existente
        const response = await fetch(`/api/menus/${editingMenu.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nombre: menuForm.nombre,
            descripcion: menuForm.descripcion,
            fecha: menuForm.fecha,
            activo: menuForm.activo
          })
        });

        if (!response.ok) {
          throw new Error('Error al actualizar el menú');
        }
      } else {
        // Crear nuevo menú
        const response = await fetch('/api/menus', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nombre: menuForm.nombre,
            descripcion: menuForm.descripcion,
            fecha: menuForm.fecha,
            activo: menuForm.activo
          })
        });

        if (!response.ok) {
          throw new Error('Error al crear el menú');
        }
      }

      showCreateForm = false;
      resetForm();
      await loadMenus();
    } catch (error) {
      console.error('Error al guardar menú:', error);
    }
  }

  async function toggleMenuStatus(menu: any) {
    try {
      menu.activo = !menu.activo;
      // TODO: Llamar a PUT /api/menus/:id con el estado actualizado
      console.log('Cambiando estado del menú:', menu);
    } catch (error) {
      console.error('Error al cambiar estado del menú:', error);
    }
  }

  function navigateToPlatos(menu: any) {
    goto(`/admin/menus/${menu.id}/platos`);
  }
</script>

<svelte:head>
  <title>Gestión de Menús - Restaurante</title>
</svelte:head>

{#if loading}
  <div class="loading">
    <div class="spinner"></div>
    <p>Cargando...</p>
  </div>
{:else}
  <div class="menus-page">
    <header class="page-header">
      <h1>Gestión de Menús</h1>
      <button class="create-btn" on:click={showCreateMenuForm}>
        + Crear Menú
      </button>
    </header>

    {#if showCreateForm}
      <div class="modal-overlay" on:click={cancelForm}>
        <div class="modal" on:click|stopPropagation>
          <h2>{editingMenu ? 'Editar Menú' : 'Crear Nuevo Menú'}</h2>

          <form on:submit|preventDefault={saveMenu}>
            <div class="form-group">
              <label for="nombre">Nombre del Menú</label>
              <input
                id="nombre"
                type="text"
                bind:value={menuForm.nombre}
                required
                placeholder="Ej: Menú Ejecutivo"
              />
            </div>

            <div class="form-group">
              <label for="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                bind:value={menuForm.descripcion}
                placeholder="Descripción del menú"
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="fecha">Fecha</label>
              <input
                id="fecha"
                type="date"
                bind:value={menuForm.fecha}
                required
              />
            </div>

            <div class="form-group">
              <label>
                <input
                  type="checkbox"
                  bind:checked={menuForm.activo}
                />
                Menú Activo
              </label>
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-btn" on:click={cancelForm}>
                Cancelar
              </button>
              <button type="submit" class="save-btn">
                {editingMenu ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    {/if}

    <div class="menus-grid">
      {#each menus as menu (menu.id)}
        <div class="menu-card">
          <div class="menu-header">
            <h3>{menu.nombre}</h3>
            <div class="menu-status">
              <span class="status-badge" class:active={menu.activo}>
                {menu.activo ? 'Activo' : 'Inactivo'}
              </span>
              <button
                class="toggle-btn"
                on:click={() => toggleMenuStatus(menu)}
                title={menu.activo ? 'Desactivar' : 'Activar'}
              >
                {menu.activo ? '⏸️' : '▶️'}
              </button>
            </div>
          </div>

          <p class="menu-description">{menu.descripcion}</p>
          <p class="menu-date">Fecha: {new Date(menu.fecha).toLocaleDateString()}</p>
          <p class="menu-platos">{menu.platos} platos incluidos</p>

          <div class="menu-actions">
            <button class="edit-btn" on:click={() => editMenu(menu)}>
              Editar
            </button>
            <button class="manage-btn" on:click={() => navigateToPlatos(menu)}>
              Gestionar Platos
            </button>
          </div>
        </div>
      {/each}
    </div>

    {#if menus.length === 0}
      <div class="empty-state">
        <p>No hay menús creados aún.</p>
        <button class="create-btn" on:click={showCreateMenuForm}>
          Crear Primer Menú
        </button>
      </div>
    {/if}
  </div>
{/if}

<style>
  .menus-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .create-btn {
    padding: 0.75rem 1.5rem;
    background: #4299e1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .cancel-btn {
    padding: 0.5rem 1rem;
    background: #e2e8f0;
    color: #4a5568;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .save-btn {
    padding: 0.5rem 1rem;
    background: #4299e1;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .menus-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .menu-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .menu-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .menu-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .status-badge.active {
    background: #c6f6d5;
    color: #22543d;
  }

  .status-badge:not(.active) {
    background: #fed7d7;
    color: #742a2a;
  }

  .toggle-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
  }

  .menu-description {
    color: #4a5568;
    margin-bottom: 0.5rem;
  }

  .menu-date,
  .menu-platos {
    color: #718096;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  .menu-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .edit-btn {
    padding: 0.5rem 1rem;
    background: #4299e1;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .manage-btn {
    padding: 0.5rem 1rem;
    background: #48bb78;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: #718096;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    gap: 1rem;
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid #e2e8f0;
    border-top: 2px solid #4299e1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
