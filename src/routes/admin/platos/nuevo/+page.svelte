<script lang="ts">
  import { onMount } from 'svelte';
  import ImageCropper from '$lib/components/ImageCropper.svelte';
  
  let fileInput: HTMLInputElement | null = null;
  let croppedImage: string | null = null;
  let selectedFile: File | null = null;
  let imageUrl: string | null = null;
  
  let formData = {
    nombre: '',
    descripcion: '',
    precio: '',
    tipoPlato: ''
  };
  
  function handleFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    selectedFile = file;
    imageUrl = URL.createObjectURL(file);
  }
  
  function handleCrop(event: CustomEvent<{ blob: Blob; dataUrl: string }>) {
    croppedImage = event.detail.dataUrl;
  }
  
  function handleCancel() {
    // Reset the file input and image URL
    if (fileInput) fileInput.value = '';
    imageUrl = null;
    croppedImage = null;
    selectedFile = null;
  }
  
  onMount(() => {
    return () => {
      // Clean up object URLs to prevent memory leaks
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  });
</script>

<div class="container mx-auto p-4">
  <h1 class="text-2xl font-bold mb-6">Nuevo Plato</h1>
  
  <form class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Left column - Image upload and crop -->
      <div class="space-y-4">
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {#if !imageUrl}
            <div class="space-y-2">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-sm text-gray-600">Arrastra una imagen o haz clic para seleccionar</p>
              <input 
                type="file" 
                accept="image/*" 
                class="hidden" 
                bind:this={fileInput}
                on:change={handleFileChange}
              />
              <button 
                type="button" 
                class="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                on:click={() => fileInput?.click()}
              >
                Seleccionar imagen
              </button>
            </div>
          {:else if !croppedImage}
            <div class="relative w-full h-64">
              <ImageCropper 
                src={imageUrl} 
                on:crop={handleCrop}
                on:cancel={handleCancel}
                aspectRatio={1}
                className="w-full h-full"
              />
            </div>
          {:else}
            <div class="space-y-4">
              <img 
                src={croppedImage} 
                alt="Vista previa" 
                class="mx-auto max-h-64 rounded-lg"
              />
              <div class="flex justify-center space-x-2">
                <button 
                  type="button" 
                  class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-300"
                  on:click={handleCancel}
                >
                  Cambiar imagen
                </button>
              </div>
            </div>
          {/if}
        </div>
      </div>
      
      <!-- Right column - Form fields -->
      <div class="space-y-4">
        <div>
          <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre del plato</label>
          <input 
            type="text" 
            id="nombre" 
            bind:value={formData.nombre}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label for="descripcion" class="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea 
            id="descripcion" 
            bind:value={formData.descripcion}
            rows="3" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          ></textarea>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="precio" class="block text-sm font-medium text-gray-700">Precio</label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">$</span>
              </div>
              <input 
                type="number" 
                id="precio" 
                bind:value={formData.precio}
                step="0.01"
                min="0"
                class="pl-7 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label for="tipoPlato" class="block text-sm font-medium text-gray-700">Tipo de plato</label>
            <select 
              id="tipoPlato" 
              bind:value={formData.tipoPlato}
              class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Selecciona un tipo</option>
              <option value="entrada">Entrada</option>
              <option value="principal">Plato principal</option>
              <option value="postre">Postre</option>
              <option value="bebida">Bebida</option>
            </select>
          </div>
        </div>
        
        <div class="pt-4">
          <button 
            type="submit" 
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={!croppedImage}
          >
            Guardar plato
          </button>
        </div>
      </div>
    </div>
  </form>
</div>