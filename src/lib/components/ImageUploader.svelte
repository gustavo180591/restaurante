<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  // Props
  export let accept: string = 'image/*';
  export let maxSize: number = 5 * 1024 * 1024; // 5MB
  export let disabled: boolean = false;
  export let multiple: boolean = false;
  export let maxFiles: number = 1;
  export let className: string = '';

  // Estado interno
  let dragover = false;
  let uploading = false;
  let progress = 0;
  let error = '';
  let files: File[] = [];
  let selectedFiles: FileList | null = null;

  const dispatch = createEventDispatcher<{
    upload: { files: File[] };
    uploaded: { results: any[] };
    error: { message: string };
    progress: { loaded: number; total: number };
  }>();

  // Función para validar archivo
  function validateFile(file: File): string | null {
    if (!file.type.startsWith('image/')) {
      return 'Solo se permiten archivos de imagen';
    }

    if (file.size > maxSize) {
      return `El archivo es demasiado grande. Máximo ${Math.round(maxSize / 1024 / 1024)}MB`;
    }

    return null;
  }

  // Función para formatear tamaño de archivo
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Función para subir archivo
  async function uploadFile(file: File) {
    const validationError = validateFile(file);
    if (validationError) {
      error = validationError;
      dispatch('error', { message: validationError });
      return;
    }

    uploading = true;
    progress = 0;
    error = '';

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/fotos', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error HTTP ${response.status}`);
      }

      const result = await response.json();
      progress = 100;

      return result;

    } catch (err: any) {
      const message = err.message || 'Error desconocido al subir archivo';
      error = message;
      dispatch('error', { message });
      throw err;
    } finally {
      uploading = false;
      progress = 0;
    }
  }

  // Manejadores de eventos
  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (!disabled) dragover = true;
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    dragover = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragover = false;

    if (disabled) return;

    const droppedFiles = e.dataTransfer?.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }

  function handleFileInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const selectedFiles = target.files;
    if (selectedFiles) {
      handleFiles(selectedFiles);
    }
  }

  function handleFiles(fileList: FileList) {
    error = '';

    // Validar límite de archivos
    if (multiple && files.length + fileList.length > maxFiles) {
      error = `Máximo ${maxFiles} archivos permitidos`;
      dispatch('error', { message: error });
      return;
    }

    const newFiles: File[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      // Si no es múltiple, solo tomar el primer archivo
      if (!multiple && newFiles.length > 0) break;

      const validationError = validateFile(file);
      if (validationError) {
        error = validationError;
        dispatch('error', { message: validationError });
        return;
      }

      newFiles.push(file);
    }

    if (newFiles.length > 0) {
      files = multiple ? [...files, ...newFiles] : newFiles;
      dispatch('upload', { files: newFiles });
    }
  }

  // Función para subir todos los archivos
  async function uploadAllFiles() {
    if (files.length === 0 || uploading) return;

    uploading = true;
    const results: any[] = [];

    try {
      for (const file of files) {
        const result = await uploadFile(file);
        if (result) {
          results.push(result);
        }
      }

      dispatch('uploaded', { results });

      // Limpiar archivos después de subir exitosamente
      files = [];
      selectedFiles = null;

    } catch (err) {
      // Error ya manejado en uploadFile
    } finally {
      uploading = false;
    }
  }

  // Función para eliminar archivo
  function removeFile(index: number) {
    if (disabled || uploading) return;
    files = files.filter((_, i) => i !== index);
    error = '';
  }

  // Función para limpiar todo
  function clearAll() {
    if (disabled || uploading) return;
    files = [];
    selectedFiles = null;
    error = '';
  }

  function triggerFileInput() {
    const input = document.getElementById('file-input') as HTMLInputElement;
    input?.click();
  }
</script>

<div class="image-uploader {className}">
  <div
    class="drop-zone"
    class:dragover
    class:disabled
    class:uploading
    role="button"
    tabindex="0"
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
    on:click={triggerFileInput}
    on:keydown={(e) => e.key === 'Enter' && triggerFileInput()}
  >
    {#if uploading}
      <div class="uploading-state">
        <div class="spinner"></div>
        <p>Subiendo... {progress}%</p>
        <small>Procesando {files.length} archivo{files.length > 1 ? 's' : ''}</small>
      </div>
    {:else if files.length > 0}
      <div class="files-preview">
        <div class="files-header">
          <h4>Archivos seleccionados ({files.length})</h4>
          <button
            type="button"
            class="clear-btn"
            on:click={clearAll}
            disabled={disabled}
            aria-label="Limpiar todos los archivos"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div class="files-list">
          {#each files as file, index (file.name + file.size + file.lastModified)}
            <div class="file-item">
              <div class="file-info">
                <div class="file-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="file-details">
                  <p class="file-name">{file.name}</p>
                  <p class="file-size">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                class="remove-btn"
                on:click={() => removeFile(index)}
                disabled={disabled}
                aria-label="Eliminar archivo"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          {/each}
        </div>

        <div class="upload-actions">
          <button
            type="button"
            class="upload-btn"
            on:click={uploadAllFiles}
            disabled={disabled || uploading}
          >
            Subir {files.length} archivo{files.length > 1 ? 's' : ''}
          </button>
        </div>
      </div>
    {:else}
      <div class="empty-state">
        <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 48 48">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
        </svg>
        <p>Arrastra y suelta {multiple ? 'imágenes' : 'una imagen'} aquí</p>
        <p class="helper-text">o haz clic para seleccionar</p>
        <p class="specs">Máx. {formatFileSize(maxSize)} • {accept}</p>
      </div>
    {/if}
  </div>

  {#if error}
    <div class="error-message">
      <p>{error}</p>
    </div>
  {/if}

  <input
    id="file-input"
    type="file"
    {accept}
    {multiple}
    style="display: none"
    on:change={handleFileInput}
    disabled={disabled || uploading}
  />
</div>

<style>
  .image-uploader {
    width: 100%;
  }

  .drop-zone {
    border: 2px dashed #cbd5e0;
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background-color: #f7fafc;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .drop-zone:hover:not(.disabled):not(.uploading) {
    border-color: #3182ce;
    background-color: #edf2f7;
  }

  .drop-zone.dragover:not(.disabled) {
    border-color: #3182ce;
    background-color: #ebf8ff;
  }

  .drop-zone.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .drop-zone.uploading {
    cursor: default;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .upload-icon {
    width: 48px;
    height: 48px;
    color: #718096;
    margin-bottom: 0.5rem;
  }

  .helper-text {
    color: #718096;
    font-size: 0.875rem;
  }

  .specs {
    color: #a0aec0;
    font-size: 0.75rem;
    margin-top: 0.5rem;
  }

  .uploading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #3182ce;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .files-preview {
    width: 100%;
  }

  .files-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .files-header h4 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #2d3748;
  }

  .clear-btn {
    padding: 0.5rem;
    background: none;
    border: none;
    color: #e53e3e;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }

  .clear-btn:hover:not(:disabled) {
    background-color: #fed7d7;
  }

  .clear-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .files-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
  }

  .file-icon {
    width: 32px;
    height: 32px;
    color: #718096;
    flex-shrink: 0;
  }

  .file-details {
    flex: 1;
    min-width: 0;
  }

  .file-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #2d3748;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0.25rem;
  }

  .file-size {
    font-size: 0.75rem;
    color: #718096;
  }

  .remove-btn {
    padding: 0.5rem;
    background: none;
    border: none;
    color: #e53e3e;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }

  .remove-btn:hover:not(:disabled) {
    background-color: #fed7d7;
  }

  .remove-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .upload-actions {
    display: flex;
    justify-content: center;
  }

  .upload-btn {
    padding: 0.75rem 1.5rem;
    background-color: #3182ce;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .upload-btn:hover:not(:disabled) {
    background-color: #2c5282;
  }

  .upload-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error-message {
    margin-top: 1rem;
    padding: 0.75rem;
    background-color: #fed7d7;
    border: 1px solid #e53e3e;
    border-radius: 4px;
    color: #c53030;
  }

  .error-message p {
    margin: 0;
    font-size: 0.875rem;
  }
</style>