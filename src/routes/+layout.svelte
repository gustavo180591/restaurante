<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import MiniCart from '$lib/components/MiniCart.svelte';
	import { onMount } from 'svelte';
	import { initializeCart } from '$lib/stores/cart';

	let { children } = $props();

	// Inicializar carrito desde localStorage
	onMount(() => {
		initializeCart();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Header -->
<header class="sticky top-0 z-40 bg-white shadow-sm">
	<nav class="container px-6 py-4 mx-auto">
		<div class="flex justify-between items-center">
			<!-- Logo -->
			<a href="/" class="flex items-center space-x-2">
				<div class="flex justify-center items-center w-10 h-10 bg-amber-600 rounded-full">
					<span class="text-lg font-bold text-white">R</span>
				</div>
				<span class="text-xl font-bold text-gray-900">Restaurante del Chef</span>
			</a>

				<div class="hidden items-center space-x-8 md:flex">
					<a href="/" class="font-medium text-gray-600 transition-colors hover:text-amber-600">Inicio</a>
					<a href="/menu" class="font-medium text-gray-600 transition-colors hover:text-amber-600">Menú</a>
					<a href="/sobre-nosotros" class="font-medium text-gray-600 transition-colors hover:text-amber-600">Sobre Nosotros</a>
					<a href="/contacto" class="font-medium text-gray-600 transition-colors hover:text-amber-600">Contacto</a>
				</div>

			<!-- Carrito y menú móvil -->
			<div class="flex items-center space-x-4">
				<!-- Auth Buttons - Desktop -->
				<div class="hidden items-center space-x-4 md:flex">
					<a href="/login" class="font-medium text-gray-600 transition-colors hover:text-amber-600">Iniciar Sesión</a>
					<a href="/registro" class="px-4 py-2 font-medium text-white bg-amber-600 rounded-md transition-colors hover:bg-amber-700">Registrarse</a>
				</div>

				<MiniCart />

				<!-- Menú móvil (hamburger) -->
				<button class="text-gray-600 md:hidden hover:text-gray-900" aria-label="Menú móvil">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>
			</div>
		</div>
	</nav>
</header>

<!-- Contenido principal -->
<main class="min-h-screen">
	{@render children?.()}
</main>

<!-- Footer -->
<footer class="py-12 mt-16 text-white bg-gray-900">
	<div class="container px-6 mx-auto">
		<div class="grid gap-8 md:grid-cols-4">
			<div>
				<h3 class="mb-4 text-xl font-bold">Restaurante del Chef</h3>
				<p class="text-gray-400">Ofreciendo experiencias gastronómicas excepcionales desde 2010.</p>
			</div>

			<div>
				<h4 class="mb-4 text-lg font-semibold">Enlaces Rápidos</h4>
				<ul class="space-y-2">
					<li><a href="/" class="text-gray-400 transition hover:text-white">Inicio</a></li>
					<li><a href="/menu" class="text-gray-400 transition hover:text-white">Menú</a></li>
					<li><a href="/sobre-nosotros" class="text-gray-400 transition hover:text-white">Sobre Nosotros</a></li>
					<li><a href="/contacto" class="text-gray-400 transition hover:text-white">Contacto</a></li>
				</ul>
			</div>

			<div>
				<h4 class="mb-4 text-lg font-semibold">Horario</h4>
				<ul class="space-y-2 text-gray-400">
					<li>Lunes - Viernes: 12:00 - 23:00</li>
					<li>Sábado: 12:00 - 23:00</li>
					<li>Domingo: 12:00 - 16:00</li>
				</ul>
			</div>

			<div>
				<h4 class="mb-4 text-lg font-semibold">Síguenos</h4>
				<div class="flex space-x-4">
					<a href="https://www.facebook.com/" class="text-gray-400 transition hover:text-white" aria-label="Facebook">
						<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
							<path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
						</svg>
					</a>
					<a href="https://www.instagram.com/" class="text-gray-400 transition hover:text-white" aria-label="Instagram">
						<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
							<path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.415-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd" />
						</svg>
					</a>
				</div>
			</div>
		</div>

		<div class="pt-8 mt-12 text-center text-gray-400 border-t border-gray-800">
			<p>&copy; {new Date().getFullYear()} Restaurante del Chef. Todos los derechos reservados.</p>
		</div>
	</div>
</footer>
