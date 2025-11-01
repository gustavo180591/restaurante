<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  interface Turno {
    id: number;
    nombre: string;
    horaInicio: string;
    horaFin: string;
  }

  interface Estado {
    id: number;
    nombre: string;
  }

  interface Plato {
    id: number;
    nombre: string;
    precio: number;
    foto: { id: number; ruta: string } | null;
    tipos: Array<{ id: number; nombre: string }>;
  }

  interface CartaDetalle {
    id: number;
    plato: Plato;
    tipoPlato: string;
  }

  let turnos: Turno[] = [];
  let estados: Estado[] = [];
  let platosDisponibles: Plato[] = [];
  let platosSeleccionados: Plato[] = [];
  let cartaDetalles: CartaDetalle[] = [];

  let loading = true;
  let saving = false;
  let error = '';
  let cartaId = '';

  // Form data
  let selectedDate = '';
  let selectedTurnoId = '';
  let selectedEstadoId = '1';

  // Load data on mount
  $: cartaId = $page.params.id;

  onMount(async () => {
    if (cartaId) {
      await Promise.all([
        loadTurnos(),
        loadEstados(),
        loadPlatosDisponibles(),
        loadCartaExistente()
      ]);
    }
    loading = false;
  });

  async function loadTurnos() {
    try {
      const response = await fetch('/api/turnos');
      if (response.ok) {
        turnos = await response.json();
      }
    } catch (err) {
      console.error('Error loading turnos:', err);
    }
  }

  async function loadEstados() {
    try {
      const response = await fetch('/api/estados');
      if (response.ok) {
        estados = await response.json();
      }
    } catch (err) {
      console.error('Error loading estados:', err);
    }
  }

  async function loadPlatosDisponibles() {
    try {
      const response = await fetch('/api/platos');
      if (response.ok) {
        platosDisponibles = await response.json();
      }
    } catch (err) {
      console.error('Error loading platos:', err);
    }
  }

  async function loadCartaExistente() {
    try {
      // Cargar detalles de la carta existente
      const detallesResponse = await fetch(`/api/cartas/${cartaId}/detalle`);
      if (detallesResponse.ok) {
        cartaDetalles = await detallesResponse.json();

        // Extraer platos seleccionados de los detalles
        platosSeleccionados = cartaDetalles.map((detalle: any) => detalle.plato);

        // Cargar información básica de la carta (necesitaría endpoint adicional)
        // Por ahora estableceremos valores por defecto
        selectedDate = new Date().toISOString().split('T')[0];
        selectedTurnoId = '1';
        selectedEstadoId = '1';
      }
    } catch (err) {
      console.error('Error loading carta existente:', err);
      error = 'Error al cargar la carta existente';
    }
  }

  function togglePlatoSeleccionado(plato: Plato) {
    const index = platosSeleccionados.findIndex(p => p.id === plato.id);
    if (index >= 0) {
      platosSeleccionados.splice(index, 1);
    } else {
      platosSeleccionados = [...platosSeleccionados, plato];
    }
    platosSeleccionados = platosSeleccionados; // Trigger reactivity
  }

  function removePlatoSeleccionado(plato: Plato) {
    platosSeleccionados = platosSeleccionados.filter(p => p.id !== plato.id);
  }

  async function saveCarta() {
    if (!selectedDate || !selectedTurnoId) {
      error = 'Fecha y turno son requeridos';
      return;
    }

    saving = true;
    error = '';

    try {
      // Nota: Necesitaríamos endpoints adicionales para actualizar cartas existentes:
      // PUT /api/cartas/[id] para actualizar la carta básica
      // DELETE /api/cartas/[id]/detalle/* para eliminar detalles existentes
      // POST /api/cartas/[id]/detalle para agregar nuevos detalles

      // Por ahora, mostraremos un mensaje indicando que esta funcionalidad
      // necesitaría endpoints adicionales
      alert('Para completar la edición de cartas, se necesitan endpoints adicionales:\n- PUT /api/cartas/[id]\n- DELETE /api/cartas/[id]/detalle/[detalleId]\n\nLa interfaz está lista pero el backend necesita estas rutas.');

      // Simular redirección después de "guardar"
      goto('/admin/cartas');

    } catch (err: any) {
      error = err.message || 'Error al guardar la carta';
    } finally {
      saving = false;
    }
  }

  function cancel() {
    goto('/admin/cartas');
  }
</script>

<svelte:head>
  <title>Editar Carta - Restaurante</title>
</svelte:head>

<div class="editar-carta">
  <header class="header">
    <h1>Editar Carta</h1>
    <div class="header-actions">
      <button on:click={cancel} class="cancel-btn">Cancelar</button>
      <button on:click={saveCarta} disabled={saving} class="save-btn">
        {#if saving}
          Guardando...
        {:else}
          Actualizar Carta
        {/if}
      </button>
    </div>
  </header>

  {#if error}
    <div class="error-message">
      <p>{error}</p>
    </div>
  {/if}

  {#if loading}
    <div class="loading">
      <p>Cargando datos...</p>
    </div>
  {:else}
    <div class="form-container">
      <!-- Información básica de la carta -->
      <div class="form-section">
        <h2>Información de la Carta</h2>
        <div class="form-grid">
          <div class="form-group">
            <label for="fecha">Fecha *</label>
            <input
              id="fecha"
              type="date"
              bind:value={selectedDate}
              required
            />
          </div>

          <div class="form-group">
            <label for="turno">Turno *</label>
            <select id="turno" bind:value={selectedTurnoId} required>
              <option value="">Seleccionar turno</option>
              {#each turnos as turno}
                <option value={turno.id}>{turno.nombre} ({turno.horaInicio} - {turno.horaFin})</option>
              {/each}
            </select>
          </div>

          <div class="form-group">
            <label for="estado">Estado</label>
            <select id="estado" bind:value={selectedEstadoId}>
              {#each estados as estado}
                <option value={estado.id}>{estado.nombre}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>

      <!-- Platos actuales -->
      {#if cartaDetalles.length > 0}
        <div class="form-section">
          <h2>Platos Actuales en la Carta</h2>
          <div class="platos-actuales">
            {#each cartaDetalles as detalle}
              <div class="plato-actual-card">
                <div class="plato-info">
                  <h4>{detalle.plato.nombre}</h4>
                  <p class="precio">${detalle.plato.precio.toFixed(2)}</p>
                  <p class="tipo">Tipo: {detalle.tipoPlato}</p>
                </div>
                <span class="incluido-badge">Incluido</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Selección de platos adicionales -->
      <div class="form-section">
        <h2>Agregar Más Platos</h2>

        {#if platosSeleccionados.length > 0}
          <div class="platos-seleccionados">
            <h3>Platos Seleccionados para Agregar ({platosSeleccionados.length})</h3>
            <div class="platos-grid">
              {#each platosSeleccionados as plato}
                <div class="plato-card seleccionado">
                  <div class="plato-info">
                    <h4>{plato.nombre}</h4>
                    <p class="precio">${plato.precio.toFixed(2)}</p>
                    <div class="tipos">
                      {#each plato.tipos as tipo}
                        <span class="tipo-badge">{tipo.nombre}</span>
                      {/each}
                    </div>
                  </div>
                  <button on:click={() => removePlatoSeleccionado(plato)} class="remove-btn">×</button>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <div class="platos-disponibles">
          <h3>Platos Disponibles</h3>
          <div class="platos-grid">
            {#each platosDisponibles.filter(plato => !cartaDetalles.some(detalle => detalle.plato.id === plato.id)) as plato}
              <div class="plato-card" class:seleccionado={platosSeleccionados.some(p => p.id === plato.id)}>
                <div class="plato-info">
                  {#if plato.foto}
                    <img src={plato.foto.ruta} alt={plato.nombre} class="plato-image" />
                  {/if}
                  <div class="plato-details">
                    <h4>{plato.nombre}</h4>
                    <p class="precio">${plato.precio.toFixed(2)}</p>
                    <div class="tipos">
                      {#each plato.tipos as tipo}
                        <span class="tipo-badge">{tipo.nombre}</span>
                      {/each}
                    </div>
                  </div>
                </div>
                <button
                  on:click={() => togglePlatoSeleccionado(plato)}
                  class="select-btn"
                  class:selected={platosSeleccionados.some(p => p.id === plato.id)}
                >
                  {platosSeleccionados.some(p => p.id === plato.id) ? 'Seleccionado' : 'Seleccionar'}
                </button>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .editar-carta {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .header h1 {
    margin: 0;
    color: #2d3748;
  }

  .header-actions {
    display: flex;
    gap: 1rem;
  }

  .cancel-btn, .save-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s;
  }

  .cancel-btn {
    background-color: #edf2f7;
    color: #4a5568;
  }

  .cancel-btn:hover {
    background-color: #e2e8f0;
  }

  .save-btn {
    background-color: #4299e1;
    color: white;
  }

  .save-btn:hover:not(:disabled) {
    background-color: #3182ce;
  }

  .save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-message {
    background-color: #fed7d7;
    border: 1px solid #e53e3e;
    color: #c53030;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .loading {
    text-align: center;
    padding: 2rem;
  }

  .form-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .form-section {
    background-color: #fff;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .form-section h2 {
    margin: 0 0 1.5rem 0;
    color: #2d3748;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .form-group label {
    font-weight: bold;
    color: #4a5568;
    margin-bottom: 0.5rem;
  }

  .form-group input, .form-group select {
    padding: 0.75rem;
    border: 1px solid #cbd5e0;
    border-radius: 4px;
    font-size: 1rem;
  }

  .form-group input:focus, .form-group select:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  }

  .platos-actuales {
    display: grid;
    gap: 1rem;
  }

  .plato-actual-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background-color: #f7fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }

  .plato-info h4 {
    margin: 0 0 0.5rem 0;
    color: #2d3748;
  }

  .precio {
    font-weight: bold;
    color: #4299e1;
    margin: 0.25rem 0;
  }

  .tipo {
    color: #4a5568;
    font-size: 0.875rem;
    margin: 0;
  }

  .incluido-badge {
    padding: 0.25rem 0.75rem;
    background-color: #48bb78;
    color: white;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: bold;
  }

  .platos-seleccionados {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .platos-seleccionados h3 {
    margin: 0 0 1rem 0;
    color: #2d3748;
  }

  .platos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .plato-card {
    display: flex;
    align-items: center;
    padding: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    transition: all 0.3s;
  }

  .plato-card.seleccionado {
    border-color: #4299e1;
    background-color: #ebf8ff;
  }

  .plato-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .plato-image {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 8px;
    margin-right: 1rem;
  }

  .plato-details h4 {
    margin: 0 0 0.5rem 0;
    color: #2d3748;
  }

  .tipos {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .tipo-badge {
    padding: 0.25rem 0.5rem;
    background-color: #edf2f7;
    color: #4a5568;
    border-radius: 12px;
    font-size: 0.75rem;
  }

  .select-btn, .remove-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.3s;
  }

  .select-btn {
    background-color: #edf2f7;
    color: #4a5568;
  }

  .select-btn.selected {
    background-color: #4299e1;
    color: white;
  }

  .select-btn:hover {
    background-color: #e2e8f0;
  }

  .select-btn.selected:hover {
    background-color: #3182ce;
  }

  .remove-btn {
    background-color: #e53e3e;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    margin-left: 1rem;
  }

  .remove-btn:hover {
    background-color: #c53030;
  }

  @media (max-width: 768px) {
    .editar-carta {
      padding: 1rem;
    }

    .header {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .platos-grid {
      grid-template-columns: 1fr;
    }

    .plato-card {
      flex-direction: column;
      text-align: center;
    }

    .plato-image {
      margin-right: 0;
      margin-bottom: 1rem;
    }

    .remove-btn {
      margin-left: 0;
      margin-top: 1rem;
    }
  }
</style>
