<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  // Props
  export let src: string;
  export let aspectRatio: number = 1; // 1:1 por defecto
  export let minWidth: number = 100;
  export let minHeight: number = 100;
  export let maxWidth: number = 800;
  export let maxHeight: number = 800;
  export let disabled: boolean = false;
  export let className: string = '';

  // Estado interno
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let image: HTMLImageElement;
  let cropArea = { x: 0, y: 0, width: 200, height: 200 };
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  let resizeHandle = '';
  let isResizing = false;
  let scale = 1;
  let offset = { x: 0, y: 0 };
  let isLoading = true;
  let error = '';

  const dispatch = createEventDispatcher<{
    crop: { blob: Blob; dataUrl: string };
    cancel: void;
    error: { message: string };
  }>();

  onMount(() => {
    if (src) {
      loadImage();
    }
  });

  // Reactive statement to reload image when src changes
  $: if (src && canvas) {
    loadImage();
  }

  function loadImage() {
    if (!src) return;

    isLoading = true;
    error = '';

    image = new Image();
    image.crossOrigin = 'anonymous';

    image.onload = () => {
      initializeCanvas();
      isLoading = false;
    };

    image.onerror = () => {
      error = 'Error al cargar la imagen';
      dispatch('error', { message: error });
      isLoading = false;
    };

    image.src = src;
  }

  function initializeCanvas() {
    if (!canvas || !image) return;

    const container = canvas.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const maxSize = Math.min(containerRect.width - 40, containerRect.height - 200, 600);

    // Calculate initial scale to fit image in container
    const imageAspect = image.width / image.height;
    let canvasWidth, canvasHeight;

    if (imageAspect > 1) {
      canvasWidth = Math.min(maxSize, image.width);
      canvasHeight = canvasWidth / imageAspect;
    } else {
      canvasHeight = Math.min(maxSize, image.height);
      canvasWidth = canvasHeight * imageAspect;
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Center the crop area initially
    const cropSize = Math.min(canvasWidth * 0.8, canvasHeight * 0.8);
    cropArea.width = cropSize;
    cropArea.height = cropSize / aspectRatio;
    cropArea.x = (canvasWidth - cropArea.width) / 2;
    cropArea.y = (canvasHeight - cropArea.height) / 2;

    // Calculate initial scale and offset to fit image
    scale = Math.min(canvasWidth / image.width, canvasHeight / image.height);
    offset.x = (canvasWidth - image.width * scale) / 2;
    offset.y = (canvasHeight - image.height * scale) / 2;

    drawCanvas();
  }

  function drawCanvas() {
    if (!ctx || !image) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context for transformations
    ctx.save();

    // Apply pan and zoom transformations
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw the image
    ctx.drawImage(image, 0, 0);

    // Restore context
    ctx.restore();

    // Draw crop area overlay
    drawCropOverlay();

    // Draw crop area border and handles
    drawCropBorder();
  }

  function drawCropOverlay() {
    if (!ctx) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear the crop area
    ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
  }

  function drawCropBorder() {
    if (!ctx) return;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    // Draw crop area border
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

    // Draw corner handles
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffffff';

    const handleSize = 8;
    const corners = [
      { x: cropArea.x, y: cropArea.y }, // top-left
      { x: cropArea.x + cropArea.width, y: cropArea.y }, // top-right
      { x: cropArea.x, y: cropArea.y + cropArea.height }, // bottom-left
      { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height } // bottom-right
    ];

    corners.forEach(corner => {
      ctx.fillRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
    });
  }

  function getResizeHandle(x: number, y: number): string {
    const handleSize = 8;
    const margin = handleSize / 2;

    const handles = [
      { name: 'top-left', x: cropArea.x, y: cropArea.y },
      { name: 'top-right', x: cropArea.x + cropArea.width, y: cropArea.y },
      { name: 'bottom-left', x: cropArea.x, y: cropArea.y + cropArea.height },
      { name: 'bottom-right', x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height }
    ];

    for (const handle of handles) {
      if (Math.abs(x - handle.x) <= margin + handleSize / 2 && Math.abs(y - handle.y) <= margin + handleSize / 2) {
        return handle.name;
      }
    }
    return '';
  }

  function handleMouseDown(e: MouseEvent) {
    if (disabled || isLoading) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    resizeHandle = getResizeHandle(x, y);

    if (resizeHandle) {
      isResizing = true;
    } else if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
               y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      isDragging = true;
      dragStart = { x: x - cropArea.x, y: y - cropArea.y };
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (disabled || isLoading) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isResizing && resizeHandle) {
      resizeCropArea(x, y);
    } else if (isDragging) {
      moveCropArea(x, y);
    }

    drawCanvas();
  }

  function handleMouseUp() {
    isDragging = false;
    isResizing = false;
    resizeHandle = '';
  }

  function resizeCropArea(x: number, y: number) {
    const aspectRatio = cropArea.width / cropArea.height;

    switch (resizeHandle) {
      case 'top-left':
        cropArea.width = Math.max(minWidth, cropArea.x + cropArea.width - x);
        cropArea.height = cropArea.width / aspectRatio;
        cropArea.x = (cropArea.x + cropArea.width) - cropArea.width;
        cropArea.y = (cropArea.y + cropArea.height) - cropArea.height;
        break;
      case 'top-right':
        cropArea.width = Math.max(minWidth, x - cropArea.x);
        cropArea.height = cropArea.width / aspectRatio;
        cropArea.y = (cropArea.y + cropArea.height) - cropArea.height;
        break;
      case 'bottom-left':
        cropArea.width = Math.max(minWidth, cropArea.x + cropArea.width - x);
        cropArea.height = cropArea.width / aspectRatio;
        cropArea.x = (cropArea.x + cropArea.width) - cropArea.width;
        break;
      case 'bottom-right':
        cropArea.width = Math.max(minWidth, x - cropArea.x);
        cropArea.height = cropArea.width / aspectRatio;
        break;
    }

    // Ensure crop area stays within canvas bounds
    if (cropArea.x < 0) cropArea.x = 0;
    if (cropArea.y < 0) cropArea.y = 0;
    if (cropArea.x + cropArea.width > canvas.width) cropArea.width = canvas.width - cropArea.x;
    if (cropArea.y + cropArea.height > canvas.height) cropArea.height = canvas.height - cropArea.y;
  }

  function moveCropArea(x: number, y: number) {
    cropArea.x = x - dragStart.x;
    cropArea.y = y - dragStart.y;

    // Ensure crop area stays within canvas bounds
    if (cropArea.x < 0) cropArea.x = 0;
    if (cropArea.y < 0) cropArea.y = 0;
    if (cropArea.x + cropArea.width > canvas.width) cropArea.x = canvas.width - cropArea.width;
    if (cropArea.y + cropArea.height > canvas.height) cropArea.y = canvas.height - cropArea.height;
  }

  // Zoom controls
  function zoomIn() {
    if (disabled || scale >= 3) return;
    scale *= 1.2;
    drawCanvas();
  }

  function zoomOut() {
    if (disabled || scale <= 0.1) return;
    scale /= 1.2;
    drawCanvas();
  }

  function resetZoom() {
    if (disabled) return;
    scale = Math.min(canvas.width / image.width, canvas.height / image.height);
    offset.x = (canvas.width - image.width * scale) / 2;
    offset.y = (canvas.height - image.height * scale) / 2;
    drawCanvas();
  }

  // Aspect ratio controls
  function setAspectRatio(ratio: number) {
    if (disabled) return;
    aspectRatio = ratio;
    cropArea.height = cropArea.width / aspectRatio;

    // Keep crop area within bounds
    if (cropArea.y + cropArea.height > canvas.height) {
      cropArea.height = canvas.height - cropArea.y;
      cropArea.width = cropArea.height * aspectRatio;
    }

    if (cropArea.x + cropArea.width > canvas.width) {
      cropArea.width = canvas.width - cropArea.x;
      cropArea.height = cropArea.width / aspectRatio;
    }

    drawCanvas();
  }

  async function cropImage(): Promise<{ blob: Blob; dataUrl: string } | null> {
    if (!ctx || !image || !canvas) return null;

    try {
      // Create a new canvas for the cropped image
      const cropCanvas = document.createElement('canvas');
      const cropCtx = cropCanvas.getContext('2d')!;

      cropCanvas.width = cropArea.width;
      cropCanvas.height = cropArea.height;

      // Calculate the source coordinates and dimensions from the original image
      const sourceX = (cropArea.x - offset.x) / scale;
      const sourceY = (cropArea.y - offset.y) / scale;
      const sourceWidth = cropArea.width / scale;
      const sourceHeight = cropArea.height / scale;

      // Draw the cropped portion
      cropCtx.drawImage(
        image,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, cropArea.width, cropArea.height
      );

      // Convert to blob and data URL
      const blob = await new Promise<Blob>((resolve) => {
        cropCanvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/jpeg', 0.9);
      });

      const dataUrl = cropCanvas.toDataURL('image/jpeg', 0.9);

      return { blob, dataUrl };
    } catch (err) {
      console.error('Error cropping image:', err);
      return null;
    }
  }

  // Event handlers for buttons
  async function handleCrop() {
    if (disabled) return;

    const result = await cropImage();
    if (result) {
      dispatch('crop', result);
    } else {
      dispatch('error', { message: 'Error al recortar la imagen' });
    }
  }

  function handleCancel() {
    if (disabled) return;
    dispatch('cancel');
  }

  // Keyboard shortcuts
  function handleKeyDown(e: KeyboardEvent) {
    if (disabled) return;

    switch (e.key) {
      case 'Escape':
        handleCancel();
        break;
      case 'Enter':
        handleCrop();
        break;
      case '+':
      case '=':
        e.preventDefault();
        zoomIn();
        break;
      case '-':
        e.preventDefault();
        zoomOut();
        break;
      case '0':
        e.preventDefault();
        resetZoom();
        break;
    }
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="image-cropper {className}">
  {#if error}
    <div class="error-message">
      <p>{error}</p>
    </div>
  {:else if isLoading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Cargando imagen...</p>
    </div>
  {:else}
    <div class="crop-container">
      <!-- Toolbar -->
      <div class="toolbar">
        <div class="zoom-controls">
          <button
            type="button"
            class="tool-btn"
            on:click={zoomOut}
            disabled={disabled || scale <= 0.1}
            title="Alejar (tecla: -)"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>

          <button
            type="button"
            class="tool-btn reset-zoom"
            on:click={resetZoom}
            disabled={disabled}
            title="Restablecer zoom (tecla: 0)"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            type="button"
            class="tool-btn"
            on:click={zoomIn}
            disabled={disabled || scale >= 3}
            title="Acercar (tecla: +)"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM12 10v3m0 0v3m0-3h3m-3 0H9" />
            </svg>
          </button>
        </div>

        <div class="aspect-controls">
          <label>Proporción:</label>
          <button
            type="button"
            class="aspect-btn"
            class:active={aspectRatio === 1}
            on:click={() => setAspectRatio(1)}
            disabled={disabled}
          >
            1:1
          </button>
          <button
            type="button"
            class="aspect-btn"
            class:active={aspectRatio === 4/3}
            on:click={() => setAspectRatio(4/3)}
            disabled={disabled}
          >
            4:3
          </button>
          <button
            type="button"
            class="aspect-btn"
            class:active={aspectRatio === 16/9}
            on:click={() => setAspectRatio(16/9)}
            disabled={disabled}
          >
            16:9
          </button>
          <button
            type="button"
            class="aspect-btn"
            class:active={aspectRatio === 3/2}
            on:click={() => setAspectRatio(3/2)}
            disabled={disabled}
          >
            3:2
          </button>
        </div>
      </div>

      <!-- Canvas container -->
      <div class="canvas-container">
        <canvas
          bind:this={canvas}
          class="crop-canvas"
          on:mousedown={handleMouseDown}
          on:mousemove={handleMouseMove}
          on:mouseup={handleMouseUp}
          on:mouseleave={handleMouseUp}
        ></canvas>
      </div>

      <!-- Action buttons -->
      <div class="actions">
        <button
          type="button"
          class="cancel-btn"
          on:click={handleCancel}
          disabled={disabled}
        >
          Cancelar
        </button>
        <button
          type="button"
          class="crop-btn"
          on:click={handleCrop}
          disabled={disabled}
        >
          Recortar imagen
        </button>
      </div>

      <!-- Instructions -->
      <div class="instructions">
        <p><strong>Instrucciones:</strong></p>
        <ul>
          <li>Arrastra el área de recorte para reposicionarla</li>
          <li>Arrastra las esquinas para redimensionar</li>
          <li>Usa los controles de zoom para acercar/alejar</li>
          <li>Selecciona una proporción de aspecto</li>
          <li>Presiona <kbd>Enter</kbd> para recortar o <kbd>Esc</kbd> para cancelar</li>
        </ul>
      </div>
    </div>
  {/if}
</div>

<style>
  .image-cropper {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
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

  .error-message {
    padding: 1rem;
    background-color: #fed7d7;
    border: 1px solid #e53e3e;
    border-radius: 4px;
    color: #c53030;
  }

  .crop-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background-color: #f7fafc;
    border-radius: 8px;
  }

  .zoom-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .aspect-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .aspect-controls label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #4a5568;
  }

  .tool-btn, .aspect-btn {
    padding: 0.5rem 0.75rem;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    color: #374151;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }

  .tool-btn:hover:not(:disabled), .aspect-btn:hover:not(:disabled) {
    background-color: #f3f4f6;
    border-color: #9ca3af;
  }

  .tool-btn:disabled, .aspect-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .reset-zoom {
    min-width: 60px;
    font-weight: 600;
  }

  .aspect-btn.active {
    background-color: #3182ce;
    color: white;
    border-color: #3182ce;
  }

  .canvas-container {
    position: relative;
    display: flex;
    justify-content: center;
    background-color: #1a202c;
    border-radius: 8px;
    overflow: hidden;
  }

  .crop-canvas {
    cursor: crosshair;
    max-width: 100%;
    height: auto;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .cancel-btn, .crop-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-btn {
    background-color: #e2e8f0;
    color: #4a5568;
  }

  .cancel-btn:hover:not(:disabled) {
    background-color: #cbd5e0;
  }

  .crop-btn {
    background-color: #3182ce;
    color: white;
  }

  .crop-btn:hover:not(:disabled) {
    background-color: #2c5282;
  }

  .cancel-btn:disabled, .crop-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .instructions {
    padding: 1rem;
    background-color: #edf2f7;
    border-radius: 6px;
    border-left: 4px solid #3182ce;
  }

  .instructions p {
    margin: 0 0 0.5rem 0;
    font-weight: 600;
    color: #2d3748;
  }

  .instructions ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .instructions li {
    font-size: 0.875rem;
    color: #4a5568;
    margin-bottom: 0.25rem;
  }

  kbd {
    padding: 0.125rem 0.375rem;
    background-color: #e2e8f0;
    border: 1px solid #cbd5e0;
    border-radius: 3px;
    font-size: 0.75rem;
    font-family: monospace;
  }

  @media (max-width: 768px) {
    .toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    .zoom-controls, .aspect-controls {
      justify-content: center;
    }

    .actions {
      flex-direction: column;
    }

    .crop-canvas {
      max-width: 100%;
      height: auto;
    }
  }
</style>