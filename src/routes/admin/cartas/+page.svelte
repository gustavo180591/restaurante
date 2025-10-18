<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  interface Carta {
    id: number;
    fecha: string;
    turno: string;
    estado: string;
    platos: number; // Número de platos en la carta
  }

  let cartas: Carta[] = [];
  let loading = true;
  let error = '';
  let selectedDate = new Date().toISOString().split('T')[0];
  let selectedTurno = '';

  onMount(async () => {
    await loadCartas();
  });

  async function loadCartas() {
    try {
      loading = true;
      let url = '/api/cartas';
      const params = new URLSearchParams();

      if (selectedDate) {
        params.append('fecha', selectedDate);
      }
      if (selectedTurno) {
        params.append('turno', selectedTurno);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al cargar las cartas');
      }
      cartas = await response.json();
    } catch (err: any) {
      error = err.message || 'Error desconocido';
    } finally {
      loading = false;
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function getEstadoColor(estado: string) {
    switch (estado.toLowerCase()) {
      case 'activa': return 'green';
      case 'pendiente': return 'yellow';
      case 'completada': return 'blue';
      default: return 'gray';
    }
  }

  async function createNewCarta() {
    goto(`/admin/cartas/nueva?fecha=${selectedDate}&turno=${selectedTurno}`);
  }

  function viewCarta(carta: Carta) {
    goto(`/admin/cartas/${carta.id}`);
  }

  function editCarta(carta: Carta) {
    goto(`/admin/cartas/${carta.id}/editar`);
  }
</script>

<svelte:head>
  <title>Gestión de Cartas - Restaurante</title>
</svelte:head>

<div class="cartas-management">
  <header class="header">
    <h1>Gestión de Cartas</h1>
    <button on:click={createNewCarta} class="create-btn">+ Nueva Carta</button>
  </header>

  <div class="filters">
    <div class="filter-group">
      <label for="fecha">Fecha:</label>
      <input
        id="fecha"
        type="date"
        bind:value={selectedDate}
        on:change={loadCartas}
      />
    </div>

    <div class="filter-group">
      <label for="turno">Turno:</label>
      <select id="turno" bind:value={selectedTurno} on:change={loadCartas}>
        <option value="">Todos los turnos</option>
        <option value="mañana">Mañana</option>
        <option value="tarde">Tarde</option>
        <option value="noche">Noche</option>
      </select>
    </div>
  </div>

  {#if loading}
    <div class="loading">
      <p>Cargando cartas...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button on:click={loadCartas}>Reintentar</button>
    </div>
  {:else}
    <div class="cartas-grid">
      {#each cartas as carta (carta.id)}
        <div class="carta-card">
          <div class="carta-header">
            <h3>{formatDate(carta.fecha)}</h3>
            <span class="turno-badge">{carta.turno}</span>
          </div>

          <div class="carta-info">
            <div class="estado-container">
              <span class="estado-label">Estado:</span>
              <span class="estado-badge" style="background-color: {getEstadoColor(carta.estado)}">
                {carta.estado}
              </span>
            </div>

            <div class="platos-count">
              <strong>{carta.platos}</strong> platos incluidos
            </div>
          </div>

          <div class="carta-actions">
            <button on:click={() => viewCarta(carta)} class="view-btn">Ver Detalles</button>
            <button on:click={() => editCarta(carta)} class="edit-btn">Editar</button>
          </div>
        </div>
      {/each}
    </div>

    {#if cartas.length === 0}
      <div class="empty-state">
        <p>No hay cartas para la fecha y turno seleccionados.</p>
        <button on:click={createNewCarta}>Crear nueva carta</button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .cartas-management {
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
    gap: 2rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background-color: #f7fafc;
    border-radius: 8px;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-group label {
    font-weight: bold;
    color: #4a5568;
  }

  .filter-group input, .filter-group select {
    padding: 0.5rem;
    border: 1px solid #cbd5e0;
    border-radius: 4px;
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

  .cartas-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .carta-card {
    background-color: #fff;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .carta-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .carta-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .carta-header h3 {
    margin: 0;
    color: #2d3748;
    text-transform: capitalize;
  }

  .turno-badge {
    padding: 0.25rem 0.75rem;
    background-color: #edf2f7;
    color: #4a5568;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: bold;
  }

  .carta-info {
    margin-bottom: 1.5rem;
  }

  .estado-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .estado-label {
    font-weight: bold;
    color: #4a5568;
  }

  .estado-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    color: white;
    font-size: 0.75rem;
    font-weight: bold;
    text-transform: uppercase;
  }

  .platos-count {
    color: #4a5568;
    font-size: 0.875rem;
  }

  .carta-actions {
    display: flex;
    gap: 0.5rem;
  }

  .view-btn, .edit-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background-color 0.3s;
  }

  .view-btn {
    background-color: #4299e1;
    color: white;
  }

  .view-btn:hover {
    background-color: #3182ce;
  }

  .edit-btn {
    background-color: #edf2f7;
    color: #4a5568;
  }

  .edit-btn:hover {
    background-color: #e2e8f0;
  }

  @media (max-width: 768px) {
    .cartas-management {
      padding: 1rem;
    }

    .header {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .filters {
      flex-direction: column;
      gap: 1rem;
    }

    .cartas-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
