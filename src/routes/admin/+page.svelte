<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let user: any = null;
  let loading = true;

  onMount(async () => {
    // Verificar autenticación
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        user = await response.json();
        loading = false;
      } else {
        goto('/login');
      }
    } catch (error) {
      goto('/login');
    }
  });

  function logout() {
    fetch('/api/auth/logout', { method: 'POST' })
      .then(() => {
        goto('/login');
      });
  }

  async function refreshData() {
    // Aquí puedes agregar lógica para refrescar datos del dashboard
    console.log('Refreshing dashboard data...');
  }
</script>

<svelte:head>
  <title>Dashboard - Restaurante</title>
</svelte:head>

{#if loading}
  <div class="loading">
    <p>Cargando...</p>
  </div>
{:else}
  <div class="dashboard">
    <header class="header">
      <h1>Dashboard de Administración</h1>
      <div class="user-info">
        <span>Bienvenido, {user?.nombre || 'Usuario'}</span>
        <button on:click={logout} class="logout-btn">Cerrar Sesión</button>
      </div>
    </header>

    <nav class="navigation">
      <a href="/admin/platos" class="nav-link">Gestión de Platos</a>
      <a href="/admin/menu" class="nav-link">Gestión de Menús</a>
      <a href="/admin/cartas" class="nav-link">Gestión de Cartas</a>
      <a href="/admin/empleados" class="nav-link">Empleados</a>
    </nav>

    <main class="main-content">
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total de Platos</h3>
          <p class="stat-number" id="total-platos">-</p>
        </div>
        <div class="stat-card">
          <h3>Menús Activos</h3>
          <p class="stat-number" id="menus-activos">-</p>
        </div>
        <div class="stat-card">
          <h3>Cartas del Día</h3>
          <p class="stat-number" id="cartas-dia">-</p>
        </div>
        <div class="stat-card">
          <h3>Empleados</h3>
          <p class="stat-number" id="total-empleados">-</p>
        </div>
      </div>

      <div class="recent-activity">
        <h2>Actividad Reciente</h2>
        <div class="activity-list">
          <div class="activity-item">
            <p>Plato "Milanesa" actualizado</p>
            <small>Hace 2 horas</small>
          </div>
          <div class="activity-item">
            <p>Nueva carta creada para el turno de la noche</p>
            <small>Hace 4 horas</small>
          </div>
          <div class="activity-item">
            <p>Empleado "Juan Pérez" agregado</p>
            <small>Hace 1 día</small>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h2>Acciones Rápidas</h2>
        <div class="actions-grid">
          <button class="action-btn primary" on:click={() => goto('/admin/platos/nuevo')}>
            + Nuevo Plato
          </button>
          <button class="action-btn secondary" on:click={() => goto('/admin/cartas/nueva')}>
            + Nueva Carta
          </button>
          <button class="action-btn tertiary" on:click={refreshData}>
            Actualizar Datos
          </button>
        </div>
      </div>
    </main>
  </div>
{/if}

<style>
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 1.2rem;
  }

  .dashboard {
    min-height: 100vh;
    background-color: #f7fafc;
  }

  .header {
    background-color: #fff;
    padding: 1rem 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header h1 {
    margin: 0;
    color: #2d3748;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .logout-btn {
    padding: 0.5rem 1rem;
    background-color: #e53e3e;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .logout-btn:hover {
    background-color: #c53030;
  }

  .navigation {
    background-color: #fff;
    padding: 1rem 2rem;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    gap: 2rem;
  }

  .nav-link {
    color: #4a5568;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: all 0.3s;
  }

  .nav-link:hover {
    background-color: #edf2f7;
    color: #2d3748;
  }

  .main-content {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background-color: #fff;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .stat-card h3 {
    margin: 0 0 1rem 0;
    color: #4a5568;
    font-size: 1rem;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: bold;
    color: #2d3748;
    margin: 0;
  }

  .recent-activity, .quick-actions {
    background-color: #fff;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }

  .recent-activity h2, .quick-actions h2 {
    margin-top: 0;
    color: #2d3748;
  }

  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .activity-item {
    padding: 1rem;
    border-left: 4px solid #4299e1;
    background-color: #f7fafc;
    border-radius: 0 4px 4px 0;
  }

  .activity-item p {
    margin: 0 0 0.5rem 0;
    color: #2d3748;
  }

  .activity-item small {
    color: #a0aec0;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .action-btn {
    padding: 1rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s;
  }

  .action-btn.primary {
    background-color: #4299e1;
    color: white;
  }

  .action-btn.primary:hover {
    background-color: #3182ce;
  }

  .action-btn.secondary {
    background-color: #48bb78;
    color: white;
  }

  .action-btn.secondary:hover {
    background-color: #38a169;
  }

  .action-btn.tertiary {
    background-color: #ed8936;
    color: white;
  }

  .action-btn.tertiary:hover {
    background-color: #dd6b20;
  }

  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .navigation {
      justify-content: center;
      flex-wrap: wrap;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
