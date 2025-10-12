<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Cropper from 'cropperjs';
  import type { CropperOptions } from 'cropperjs';
  import 'cropperjs/dist/cropper.min.css';
  
  let preview: HTMLImageElement | null = null;
  let fileInput: HTMLInputElement;
  let croppedImage: string | null = null;
  let formData = {
    nombre: '',
    descripcion: '',
    precio: '',
    tipoPlato: ''
  };
  
  // Store cropper instance
  let cropperInstance: InstanceType<typeof Cropper> | null = null;
  
  function handleFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file || !preview) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result || !preview) return;
      
      preview.src = e.target.result as string;
      preview.style.display = 'block';
      
      // Destroy existing cropper instance if it exists
      if (cropperInstance) {
        cropperInstance.destroy();
        cropperInstance = null;
      }
      
      // Initialize cropper with proper type
      const options: CropperOptions = {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 0.8,
        movable: true,
        zoomable: true,
        rotatable: true,
        scalable: true
      };
      
      cropperInstance = new Cropper(preview, options);
    };
    reader.readAsDataURL(file);
  }
  
  function cropImage() {
    if (!cropperInstance) return;
    
    const canvas = cropperInstance.getCroppedCanvas({
      width: 800,
      height: 600,
      minWidth: 400,
      minHeight: 300,
      maxWidth: 1200,
      maxHeight: 900,
      fillColor: '#fff',
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high' as ImageSmoothingQuality,
    });
    
    if (canvas) {
      croppedImage = canvas.toDataURL('image/jpeg', 0.9);
    }
  }

  // Clean up cropper on component destroy
  onDestroy(() => {
    if (cropperInstance) {
      cropperInstance.destroy();
    }
  });
</script>