declare module 'svelte-image' {
  import { SvelteComponentTyped } from 'svelte';

  interface ImgProps {
    src: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
    class?: string;
    loading?: 'lazy' | 'eager';
    decoding?: 'async' | 'sync' | 'auto';
  }

  export default class Img extends SvelteComponentTyped<ImgProps> {}
}