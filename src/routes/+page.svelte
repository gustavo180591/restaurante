<script lang="ts">
  import { onMount } from 'svelte';
  import { monitoring } from '$lib/monitoring';

  onMount(() => {
    // Registrar visita a página principal
    monitoring.logUserAction('page_visit', undefined, {
      page: 'home',
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    });

    // Monitorear tiempo de carga de la página
    const loadTime = performance.now();
    monitoring.logPerformance('page_load_home', Math.round(loadTime), {
      success: true
    });

    // Configurar scroll listener
    const handleScroll = () => {
      isScrolled = window.scrollY > 50;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  // Datos de ejemplo para el menú del día
  const menuDelDia = [
    { nombre: 'Ensalada César', descripcion: 'Lechuga romana, crutones, queso parmesano, aderezo césar', precio: 12.99 },
    { nombre: 'Pasta Carbonara', descripcion: 'Pasta con salsa cremosa de huevo, queso, panceta y pimienta negra', precio: 15.99 },
    { nombre: 'Parrillada de Verduras', descripcion: 'Verduras de temporada a la parrilla con aceite de oliva', precio: 13.99 },
    { nombre: 'Tiramisú', descripcion: 'Postre italiano clásico con café y cacao en polvo', precio: 7.99 }
  ];

  let isScrolled = false;
</script>
  <title>Restaurante del Chef - Inicio</title>
  <meta name="description" content="Disfruta de la mejor gastronomía en un ambiente acogedor y con ingredientes de primera calidad." />
</svelte:head>

<!-- Hero Section -->
<header class="relative h-screen flex items-center justify-center bg-gray-900 text-white overflow-hidden">
  <div class="absolute inset-0 z-0">
    <div class="absolute inset-0 bg-black/60"></div>
    <img 
      src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
      alt="Restaurante" 
      class="w-full h-full object-cover"
    />
  </div>
  
  <div class="container mx-auto px-6 z-10 text-center">
    <h1 class="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">Bienvenidos a Nuestro Restaurante</h1>
    <p class="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">Disfruta de una experiencia gastronómica única con los sabores más exquisitos</p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="#menu" class="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105">
        Ver Menú
      </a>
      <a href="#reservas" class="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300">
        Reservar Mesa
      </a>
    </div>
  </div>
  
  <div class="absolute bottom-20 left-1/2 transform -translate-x-1/2 animate-bounce" style="margin-top: -3rem;">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  </div>
</header>

<!-- Sobre Nosotros -->
<section id="sobre-nosotros" class="py-20 bg-white">
  <div class="container mx-auto px-6">
    <div class="flex flex-col md:flex-row items-center">
      <div class="md:w-1/2 mb-10 md:mb-0 md:pr-10">
        <h2 class="text-4xl font-bold text-gray-900 mb-6">Nuestra Historia</h2>
        <p class="text-lg text-gray-700 mb-6">
          Fundado en 2010, nuestro restaurante ha sido un referente en la gastronomía local, ofreciendo platos excepcionales preparados con ingredientes frescos y de la más alta calidad.
        </p>
        <p class="text-lg text-gray-700 mb-8">
          Nuestro chef ejecutivo, con más de 20 años de experiencia, combina técnicas tradicionales con toques innovadores para crear una experiencia culinaria inolvidable.
        </p>
        <a href="/sobre-nosotros" class="text-amber-600 font-semibold hover:text-amber-700 text-lg flex items-center">
          Conoce más sobre nosotros
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </a>
      </div>
      <div class="md:w-1/2">
        <div class="relative rounded-lg overflow-hidden shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80" 
            alt="Chef preparando plato" 
            class="w-full h-auto"
          />
          <div class="absolute -bottom-6 -right-6 bg-amber-600 text-white p-6 rounded-lg shadow-lg w-48">
            <span class="block text-4xl font-bold">10+</span>
            <span class="text-lg">Años de Experiencia</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Menú del Día -->
<section id="menu" class="py-20 bg-gray-50">
  <div class="container mx-auto px-6">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-bold text-gray-900 mb-4">Menú del Día</h2>
      <div class="w-24 h-1 bg-amber-600 mx-auto"></div>
    </div>
    
    <div class="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {#each menuDelDia as item, i}
        <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex">
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">{item.nombre}</h3>
            <p class="text-gray-600 mb-4">{item.descripcion}</p>
            <span class="text-amber-600 font-bold text-lg">${item.precio.toFixed(2)}</span>
          </div>
          <div class="ml-4 w-24 h-24 bg-gray-200 rounded overflow-hidden">
            <img 
              src={`https://source.unsplash.com/random/200x200/?food,${i}`} 
              alt={item.nombre} 
              class="w-full h-full object-cover"
            />
          </div>
        </div>
      {/each}
    </div>
    
    <div class="text-center mt-12">
      <a href="/menu" class="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105">
        Ver Menú Completo
      </a>
    </div>
  </div>
</section>

<!-- Testimonios -->
<section class="py-20 bg-gray-900 text-white">
  <div class="container mx-auto px-6">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-bold mb-4">Lo Que Dicen Nuestros Clientes</h2>
      <div class="w-24 h-1 bg-amber-600 mx-auto"></div>
    </div>
    
    <div class="grid md:grid-cols-3 gap-8">
      {#each [1, 2, 3] as i}
        <div class="bg-gray-800 p-8 rounded-lg">
          <div class="flex items-center mb-4">
            {#each [1, 2, 3, 4, 5]}
              <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            {/each}
          </div>
          <p class="text-gray-300 mb-6">
            "La mejor experiencia gastronómica que he tenido en mucho tiempo. Cada plato es una obra de arte y los sabores son increíbles."
          </p>
          <div class="flex items-center">
            <div class="w-12 h-12 rounded-full bg-gray-700 mr-4 overflow-hidden">
              <img 
                src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i * 10}.jpg`} 
                alt="Cliente" 
                class="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 class="font-semibold">Cliente Satisfecho</h4>
              <p class="text-sm text-gray-400">Visita frecuente</p>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Reservaciones -->
<section id="reservas" class="py-20 bg-white">
  <div class="container mx-auto px-6">
    <div class="max-w-4xl mx-auto bg-gray-50 rounded-xl overflow-hidden shadow-lg">
      <div class="md:flex">
        <div class="md:w-1/2 bg-amber-600 p-12 text-white">
          <h2 class="text-3xl font-bold mb-6">Reserva tu Mesa</h2>
          <p class="mb-8">Asegura tu lugar en nuestro restaurante. Completa el formulario y nos pondremos en contacto contigo para confirmar tu reserva.</p>
          
          <div class="space-y-4">
            <div class="flex items-start">
              <div class="flex-shrink-0 mt-1">
                <svg class="h-6 w-6 text-amber-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-amber-100">Calle Falsa 123</p>
                <p class="text-amber-100">Buenos Aires, Argentina</p>
              </div>
            </div>
            
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-amber-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-amber-100">+54 11 1234-5678</p>
                <p class="text-amber-100">info@restaurante.com</p>
              </div>
            </div>
            
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-amber-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-amber-100">Lunes a Sábado: 12:00 - 23:00</p>
                <p class="text-amber-100">Domingo: 12:00 - 16:00</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="md:w-1/2 p-12">
          <form class="space-y-6">
            <div>
              <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input type="text" id="nombre" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
            </div>
            
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <input type="email" id="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="fecha" class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input type="date" id="fecha" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
              </div>
              
              <div>
                <label for="hora" class="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                <select id="hora" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                  <option value="12:00">12:00 PM</option>
                  <option value="12:30">12:30 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="13:30">1:30 PM</option>
                  <option value="19:00">7:00 PM</option>
                  <option value="19:30">7:30 PM</option>
                  <option value="20:00">8:00 PM</option>
                  <option value="20:30">8:30 PM</option>
                </select>
              </div>
            </div>
            
            <div>
              <label for="personas" class="block text-sm font-medium text-gray-700 mb-1">Número de personas</label>
              <select id="personas" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                <option value="1">1 persona</option>
                <option value="2">2 personas</option>
                <option value="3">3 personas</option>
                <option value="4">4 personas</option>
                <option value="5">5 personas</option>
                <option value="6">6+ personas</option>
              </select>
            </div>
            
            <div>
              <label for="notas" class="block text-sm font-medium text-gray-700 mb-1">Notas adicionales</label>
              <textarea id="notas" rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"></textarea>
            </div>
            
            <button type="submit" class="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
              Reservar Ahora
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Animaciones -->
<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fade-in {
    animation: fadeIn 1s ease-out forwards;
  }
  
  .animate-bounce {
    animation: bounce 2s infinite;
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-20px); }
    60% { transform: translateY(-10px); }
  }
</style>