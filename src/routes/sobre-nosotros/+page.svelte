<script lang="ts">
  import { onMount } from 'svelte';
</script>

<svelte:head>
  <title>Sobre Nosotros - Restaurante del Chef</title>
  <meta name="description" content="Conoce la historia, el equipo y los valores que hacen único a nuestro restaurante." />
</svelte:head>

<!-- Hero Section -->
<header class="relative h-96 flex items-center justify-center bg-gray-900 text-white overflow-hidden">
  <div class="absolute inset-0 bg-black/60"></div>
  <img
    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    alt="Nuestro Equipo"
    class="w-full h-full object-cover"
  />

  <div class="container mx-auto px-6 z-10 text-center">
    <h1 class="text-5xl md:text-7xl font-bold mb-6">Sobre Nosotros</h1>
    <p class="text-xl md:text-2xl max-w-3xl mx-auto">Descubre la pasión y dedicación que ponemos en cada plato</p>
  </div>
</header>

<!-- Nuestra Historia -->
<section class="py-20 bg-white">
  <div class="container mx-auto px-6">
    <div class="flex flex-col md:flex-row items-center">
      <div class="md:w-1/2 mb-10 md:mb-0 md:pr-10">
        <h2 class="text-4xl font-bold text-gray-900 mb-6">Nuestra Historia</h2>
        <p class="text-lg text-gray-700 mb-6">
          Fundado en 2010 en el corazón de Buenos Aires, nuestro restaurante nació de la pasión por la gastronomía auténtica y la búsqueda constante de la excelencia culinaria.
        </p>
        <p class="text-lg text-gray-700 mb-6">
          Desde nuestros humildes comienzos como un pequeño bistró familiar, hemos crecido hasta convertirnos en un referente de la cocina local, siempre manteniendo nuestro compromiso con ingredientes frescos, técnicas tradicionales y un servicio excepcional.
        </p>
        <p class="text-lg text-gray-700 mb-8">
          Cada plato que servimos cuenta una historia: la historia de nuestras raíces, nuestra comunidad y nuestro inquebrantable amor por la buena comida.
        </p>
      </div>
      <div class="md:w-1/2">
        <div class="relative rounded-lg overflow-hidden shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
            alt="Interior del restaurante"
            class="w-full h-auto"
          />
          <div class="absolute -bottom-6 -right-6 bg-amber-600 text-white p-6 rounded-lg shadow-lg w-48">
            <span class="block text-4xl font-bold">14+</span>
            <span class="text-lg">Años de Tradición</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Nuestro Chef Ejecutivo -->
<section class="py-20 bg-gray-50">
  <div class="container mx-auto px-6">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-bold text-gray-900 mb-4">Conoce a Nuestro Chef</h2>
      <div class="w-24 h-1 bg-amber-600 mx-auto"></div>
    </div>

    <div class="flex flex-col md:flex-row items-center">
      <div class="md:w-1/2 mb-10 md:mb-0 md:pr-10">
        <div class="relative rounded-lg overflow-hidden shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
            alt="Chef preparando plato"
            class="w-full h-auto"
          />
        </div>
      </div>

      <div class="md:w-1/2">
        <h3 class="text-3xl font-bold text-gray-900 mb-4">Chef Ejecutivo - María González</h3>
        <p class="text-lg text-gray-700 mb-6">
          Con más de 20 años de experiencia en las mejores cocinas de Europa y América Latina, nuestra chef ejecutiva María González lidera nuestro equipo culinario con pasión y creatividad.
        </p>
        <p class="text-lg text-gray-700 mb-6">
          Especializada en cocina fusión, combina técnicas tradicionales argentinas con influencias internacionales, creando platos únicos que deleitan todos los sentidos.
        </p>
        <p class="text-lg text-gray-700 mb-8">
          "La cocina es arte, ciencia y amor. Cada ingrediente cuenta una historia, y cada plato es una oportunidad para crear recuerdos inolvidables."
        </p>

        <div class="grid grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-amber-600">20+</div>
            <div class="text-sm text-gray-600">Años de Experiencia</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-amber-600">50+</div>
            <div class="text-sm text-gray-600">Platos Creados</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-amber-600">15</div>
            <div class="text-sm text-gray-600">Premios Ganados</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Nuestros Valores -->
<section class="py-20 bg-white">
  <div class="container mx-auto px-6">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-bold text-gray-900 mb-4">Nuestros Valores</h2>
      <div class="w-24 h-1 bg-amber-600 mx-auto"></div>
    </div>

    <div class="grid md:grid-cols-3 gap-8">
      <div class="text-center p-8 bg-gray-50 rounded-lg">
        <div class="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-4">Pasión</h3>
        <p class="text-gray-600">Ponemos el corazón en cada plato que servimos, asegurando que cada experiencia sea memorable.</p>
      </div>

      <div class="text-center p-8 bg-gray-50 rounded-lg">
        <div class="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-4">Calidad</h3>
        <p class="text-gray-600">Utilizamos solo los ingredientes más frescos y de la más alta calidad para garantizar la excelencia.</p>
      </div>

      <div class="text-center p-8 bg-gray-50 rounded-lg">
        <div class="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-4">Comunidad</h3>
        <p class="text-gray-600">Creemos en el poder de la comida para unir a las personas y fortalecer nuestra comunidad local.</p>
      </div>
    </div>
  </div>
</section>

<!-- Nuestro Equipo -->
<section class="py-20 bg-gray-900 text-white">
  <div class="container mx-auto px-6">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-bold mb-4">Nuestro Equipo</h2>
      <div class="w-24 h-1 bg-amber-600 mx-auto"></div>
    </div>

    <div class="grid md:grid-cols-4 gap-8">
      <div class="text-center">
        <div class="w-32 h-32 rounded-full bg-gray-700 mx-auto mb-4 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
            alt="Miembro del equipo"
            class="w-full h-full object-cover"
          />
        </div>
        <h3 class="text-xl font-bold mb-2">Carlos Rodríguez</h3>
        <p class="text-amber-400 mb-2">Sous Chef</p>
        <p class="text-gray-300 text-sm">Especialista en carnes y parrilla tradicional.</p>
      </div>

      <div class="text-center">
        <div class="w-32 h-32 rounded-full bg-gray-700 mx-auto mb-4 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
            alt="Miembro del equipo"
            class="w-full h-full object-cover"
          />
        </div>
        <h3 class="text-xl font-bold mb-2">Ana López</h3>
        <p class="text-amber-400 mb-2">Jefa de Sala</p>
        <p class="text-gray-300 text-sm">Experta en servicio al cliente y vinos.</p>
      </div>

      <div class="text-center">
        <div class="w-32 h-32 rounded-full bg-gray-700 mx-auto mb-4 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
            alt="Miembro del equipo"
            class="w-full h-full object-cover"
          />
        </div>
        <h3 class="text-xl font-bold mb-2">Roberto Silva</h3>
        <p class="text-amber-400 mb-2">Pastelero</p>
        <p class="text-gray-300 text-sm">Maestro en postres y repostería fina.</p>
      </div>

      <div class="text-center">
        <div class="w-32 h-32 rounded-full bg-gray-700 mx-auto mb-4 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
            alt="Miembro del equipo"
            class="w-full h-full object-cover"
          />
        </div>
        <h3 class="text-xl font-bold mb-2">Lucía Fernández</h3>
        <p class="text-amber-400 mb-2">Sommelier</p>
        <p class="text-gray-300 text-sm">Especialista en maridaje de vinos.</p>
      </div>
    </div>
  </div>
</section>

<!-- Call to Action -->
<section class="py-20 bg-amber-600 text-white">
  <div class="container mx-auto px-6 text-center">
    <h2 class="text-4xl font-bold mb-6">¿Listo para vivir una experiencia inolvidable?</h2>
    <p class="text-xl mb-8 max-w-2xl mx-auto">Ven a visitarnos y descubre por qué somos el restaurante preferido de la ciudad.</p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/reservas" class="bg-white text-amber-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 transition duration-300">
        Reservar Mesa
      </a>
      <a href="/menu" class="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-white hover:text-amber-600 transition duration-300">
        Ver Menú
      </a>
    </div>
  </div>
</section>
