<script lang="ts">
  let name = '';
  let email = '';
  let phone = '';
  let subject = '';
  let message = '';
  let isSubmitting = false;
  let submitSuccess = false;
  let submitError = '';
  
  const handleSubmit = async () => {
    if (!name || !email || !message) {
      submitError = 'Por favor complete los campos obligatorios';
      return;
    }
    
    isSubmitting = true;
    submitError = '';
    
    try {
      // Simular envío del formulario
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Éxito
      submitSuccess = true;
      
      // Limpiar el formulario
      name = '';
      email = '';
      phone = '';
      subject = '';
      message = '';
      
      // Ocultar mensaje después de 5 segundos
      setTimeout(() => {
        submitSuccess = false;
      }, 5000);
    } catch (error) {
      submitError = 'Hubo un error al enviar el mensaje. Por favor, intente nuevamente.';
      console.error('Error submitting form:', error);
    } finally {
      isSubmitting = false;
    }
  };
   const horarios: { day: string; hours: string }[] = [
    { day: 'Sábado', hours: '11:00 AM - 12:00 AM' },
    { day: 'Domingo', hours: '11:00 AM - 11:00 PM' }
  ];
</script>

<div class="px-4 py-12 min-h-screen bg-gray-50 sm:px-6 lg:px-8">
  <div class="mx-auto max-w-7xl">
    <!-- Encabezado -->
    <div class="mb-12 text-center">
      <h1 class="mb-4 text-4xl font-bold text-gray-900">Contáctenos</h1>
      <p class="mx-auto max-w-2xl text-xl text-gray-600">Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.</p>
    </div>
    
    <!-- Mensajes de éxito/error -->
    {#if submitSuccess}
      <div class="p-4 mb-8 text-green-700 bg-green-100 rounded border border-green-400">
        <strong class="font-bold">¡Mensaje enviado!</strong>
        <span class="block sm:inline"> Hemos recibido tu mensaje y nos pondremos en contacto contigo pronto.</span>
      </div>
    {/if}
    
    {#if submitError}
      <div class="p-4 mb-8 text-red-700 bg-red-100 rounded border border-red-400">
        <strong class="font-bold">Error:</strong>
        <span class="block sm:inline"> {submitError}</span>
      </div>
    {/if}
    
    <div class="overflow-hidden bg-white rounded-lg shadow-xl">
      <div class="grid grid-cols-1 lg:grid-cols-2">
        <!-- Formulario de contacto -->
        <div class="p-8">
          <h2 class="mb-6 text-2xl font-bold text-gray-900">Envíanos un mensaje</h2>
          
          <form on:submit|preventDefault={handleSubmit} class="space-y-6">
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <!-- Nombre -->
              <div class="col-span-2 md:col-span-1">
                <label for="name" class="block mb-1 text-sm font-medium text-gray-700">
                  Nombre completo <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  bind:value={name}
                  class="px-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
              
              <!-- Correo electrónico -->
              <div class="col-span-2 md:col-span-1">
                <label for="email" class="block mb-1 text-sm font-medium text-gray-700">
                  Correo electrónico <span class="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  bind:value={email}
                  class="px-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
              
              <!-- Teléfono -->
              <div class="col-span-2 md:col-span-1">
                <label for="phone" class="block mb-1 text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  bind:value={phone}
                  class="px-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <!-- Asunto -->
              <div class="col-span-2 md:col-span-1">
                <label for="subject" class="block mb-1 text-sm font-medium text-gray-700">
                  Asunto
                </label>
                <input
                  type="text"
                  id="subject"
                  bind:value={subject}
                  class="px-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <!-- Mensaje -->
              <div class="col-span-2">
                <label for="message" class="block mb-1 text-sm font-medium text-gray-700">
                  Mensaje <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  bind:value={message}
                  rows="5"
                  class="px-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                ></textarea>
              </div>
            </div>
            
            <!-- Botón de envío -->
            <div class="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                class="px-8 py-3 w-full font-bold text-white bg-amber-600 rounded-md transition duration-300 md:w-auto hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {#if isSubmitting}
                  <svg class="inline-block mr-3 -ml-1 w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                {:else}
                  Enviar mensaje
                {/if}
              </button>
            </div>
          </form>
        </div>
        
        <!-- Información de contacto -->
        <div class="flex flex-col justify-between p-8 bg-gray-50">
          <div>
            <h2 class="mb-6 text-2xl font-bold text-gray-900">Información de contacto</h2>
            
            <div class="space-y-6">
              <!-- Dirección -->
              <div class="flex items-start">
                <div class="flex-shrink-0 p-2 bg-amber-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Dirección</h3>
                  <p class="text-gray-600">Av. Principal 1234</p>
                  <p class="text-gray-600">Buenos Aires, Argentina</p>
                </div>
              </div>
              
              <!-- Teléfono -->
              <div class="flex items-start">
                <div class="flex-shrink-0 p-2 bg-amber-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Teléfono</h3>
                  <p class="text-gray-600">+54 11 1234-5678</p>
                  <p class="text-gray-600">Lun-Dom: 11:00 AM - 11:00 PM</p>
                </div>
              </div>
              
              <!-- Correo electrónico -->
              <div class="flex items-start">
                <div class="flex-shrink-0 p-2 bg-amber-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Correo electrónico</h3>
                  <p class="text-gray-600">info@restaurante.com</p>
                  <p class="text-gray-600">reservas@restaurante.com</p>
                </div>
              </div>
            </div>
            
            <!-- Redes sociales -->
            <div class="mt-8">
              <h3 class="mb-4 text-lg font-medium text-gray-900">Síguenos</h3>
              <div class="flex space-x-4">
                <a href="https://www.facebook.com/" class="text-gray-500 transition duration-300 hover:text-amber-600">
                  <span class="sr-only">Facebook</span>
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
                  </svg>
                </a>
                <a href="https://www.instagram.com/" class="text-gray-500 transition duration-300 hover:text-amber-600">
                  <span class="sr-only">Instagram</span>
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.04v-.8c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd" />
                  </svg>
                </a>
                <a href="https://www.twitter.com/" class="text-gray-500 transition duration-300 hover:text-amber-600">
                  <span class="sr-only">Twitter</span>
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <!-- Mapa -->
          <div class="overflow-hidden mt-8 rounded-lg">
            <iframe 
              title="Ubicación del restaurante en el mapa"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d105073.44379606317!2d-58.5035105!3d-34.6156624!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcca3b4ef90cbd%3A0a0b3812e88e88e87!2sBuenos%20Aires%2C%20CABA!5e0!3m2!1ses-419!2sar!4v1633028665934!5m2!1ses-419!2sar" 
              width="100%" 
              height="200" 
              style="border:0;" 
              allowfullscreen
              loading="lazy"
              class="rounded-lg shadow-md"
            ></iframe>          
          </div>
        </div>
      </div>
    </div>
    
    <!-- Sección de horarios -->
    <div class="overflow-hidden mt-16 bg-white rounded-lg shadow-xl">
      <div class="p-8">
        <h2 class="mb-6 text-2xl font-bold text-gray-900">Horarios de atención</h2>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-7">
          {#each horarios as { day, hours }}
            <div class="p-4 text-center bg-gray-50 rounded-lg">
              <h3 class="font-medium text-gray-900">{day}</h3>
              <p class="text-gray-600">{hours}</p>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
