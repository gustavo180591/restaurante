<script>
  import Img from 'svelte-image';
  export let src;
  export let alt = '';
  export let width;
  export let height;
  export let className = '';
</script>

<Img
  {src}
  {alt}
  {width}
  {height}
  class={className}
  loading="lazy"
  decoding="async"
/>