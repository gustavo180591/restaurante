declare module 'cropperjs' {
  export interface CropperOptions {
    aspectRatio?: number;
    viewMode?: 0 | 1 | 2 | 3;
    autoCropArea?: number;
    movable?: boolean;
    zoomable?: boolean;
    rotatable?: boolean;
    scalable?: boolean;
  }

  export default class Cropper {
    constructor(element: HTMLImageElement, options?: CropperOptions);
    destroy(): void;
    getCroppedCanvas(options?: {
      width?: number;
      height?: number;
      minWidth?: number;
      minHeight?: number;
      maxWidth?: number;
      maxHeight?: number;
      fillColor?: string;
      imageSmoothingEnabled?: boolean;
      imageSmoothingQuality?: 'low' | 'medium' | 'high';
    }): HTMLCanvasElement;
  }
}
