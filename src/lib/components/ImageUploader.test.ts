import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ImageUploader from '$lib/components/ImageUploader.svelte';

describe('ImageUploader', () => {
  it('renders correctly', () => {
    render(ImageUploader);
    expect(screen.getByText('Arrastra y suelta imágenes aquí, o haz clic para seleccionar')).toBeInTheDocument();
  });

  it('shows error for large files', async () => {
    // This would test the file size validation
    // For a full implementation, we'd mock file input and upload
    render(ImageUploader, { props: { maxSize: 1024 } });
    // Additional test logic would go here
  });
});
