<script>
  let name = '';
  let email = '';
  let phone = '';
  let date = '';
  let time = '';
  let guests = 2;
  let specialRequests = '';
  let isSubmitting = false;
  let submitSuccess = false;
  let submitError = '';
  
  const availableTimes = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];
  
  $: today = new Date().toISOString().split('T')[0];
  $: maxDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  })();
  
  function handleSubmit() {
    if (!name || !email || !date || !time || !guests) {
      submitError = 'Por favor, complete todos los campos obligatorios';
      return;
    }
    
    isSubmitting = true;
    submitError = '';
    
    // Simular envío
    setTimeout(() => {
      submitSuccess = true;
      isSubmitting = false;
      
      // Limpiar formulario
      name = '';
      email = '';
      phone = '';
      date = '';
      time = '';
      guests = 2;
      specialRequests = '';
      
      // Ocultar mensaje después de 5 segundos
      setTimeout(() => {
        submitSuccess = false;
      }, 5000);
    }, 1000);
  }
</script>

<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Reserva tu Mesa</h1>
      <p class="text-xl text-gray-600">Disfruta de una experiencia culinaria inolvidable</p>
    </div>
    
    {#if submitSuccess}
      <div class="mb-8 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
        <strong class="font-bold">¡Reserva exitosa!</strong>
        <span class="block sm:inline"> Hemos recibido tu solicitud. Te contactaremos pronto para confirmar.</span>
      </div>
    {/if}
    
    {#if submitError}
      <div class="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <strong class="font-bold">Error:</strong>
        <span class="block sm:inline"> {submitError}</span>
      </div>
    {/if}
    
    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
      <div class="p-6 md:p-8">
        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Nombre -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                bind:value={name}
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
            
            <!-- Correo electrónico -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico <span class="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                bind:value={email}
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
            
            <!-- Teléfono -->
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                bind:value={phone}
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            
            <!-- Fecha -->
            <div>
              <label for="date" class="block text-sm font-medium text-gray-700 mb-1">
                Fecha <span class="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                bind:value={date}
                min={today}
                max={maxDate}
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
            
            <!-- Hora -->
            <div>
              <label for="time" class="block text-sm font-medium text-gray-700 mb-1">
                Hora <span class="text-red-500">*</span>
              </label>
              <select
                id="time"
                bind:value={time}
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              >
                <option value="" disabled selected>Selecciona una hora</option>
                {#each availableTimes as t}
                  <option value={t}>{t}</option>
                {/each}
              </select>
            </div>
            
            <!-- Número de comensales -->
            <div>
              <label for="guests" class="block text-sm font-medium text-gray-700 mb-1">
                Número de comensales <span class="text-red-500">*</span>
              </label>
              <select
                id="guests"
                bind:value={guests}
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              >
                {#each Array.from({ length: 10 }, (_, i) => i + 1) as num}
                  <option value={num}>
                    {num} {num === 1 ? 'persona' : 'personas'}
                  </option>
                {/each}
                <option value="11">Más de 10 personas</option>
              </select>
            </div>
          </div>
          
          <!-- Solicitudes especiales -->
          <div>
            <label for="special-requests" class="block text-sm font-medium text-gray-700 mb-1">
              Solicitudes especiales (opcional)
            </label>
            <textarea
              id="special-requests"
              bind:value={specialRequests}
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Ej: Alergias, preferencias de asiento, celebraciones especiales, etc."
            ></textarea>
          </div>
          
          <!-- Botón de envío -->
          <div class="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {#if isSubmitting}
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              {:else}
                Reservar ahora
              {/if}
            </button>
          </div>
        </form>
      </div>
      
      <!-- Información de contacto -->
      <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="mb-4 md:mb-0">
            <h3 class="text-lg font-medium text-gray-900">¿Necesitas ayuda?</h3>
            <p class="text-sm text-gray-500">Llama al +1 234 567 890 o envía un correo a reservas@restaurante.com</p>
          </div>
          <div class="text-sm text-gray-500">
            <p>Horario de atención: Lunes a Domingo</p>
            <p>12:00 PM - 11:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
