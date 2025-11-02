<script lang="ts">
    import { onMount } from 'svelte';
    
    onMount(() => {
        // Establecer el título de la página
        document.title = 'Términos y Condiciones - Restaurante';
        // Desplazarse al inicio de la página
        window.scrollTo(0, 0);
    });
</script>

<div class="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
            <h1 class="text-4xl font-extrabold text-amber-900 mb-4">Términos y Condiciones</h1>
            <p class="text-lg text-amber-800">Última actualización: 1 de Noviembre de 2025</p>
        </div>
        
        <div class="bg-white rounded-lg shadow-lg p-8">
            <div class="prose prose-amber max-w-none">
                <section class="mb-8">
                    <h2 class="text-2xl font-bold text-amber-800 mb-4">1. Aceptación de los Términos</h2>
                    <p class="text-gray-700 mb-4">
                        Al acceder y utilizar nuestro sitio web y servicios, usted acepta cumplir con estos términos y condiciones. 
                        Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
                    </p>
                </section>

                <section class="mb-8">
                    <h2 class="text-2xl font-bold text-amber-800 mb-4">2. Uso del Servicio</h2>
                    <p class="text-gray-700 mb-4">
                        Nuestro servicio está diseñado para facilitar la reserva de mesas y pedidos en nuestro restaurante. 
                        Usted acepta utilizar el servicio únicamente con fines legales y de acuerdo con estos términos.
                    </p>
                </section>

                <section class="mb-8">
                    <h2 class="text-2xl font-bold text-amber-800 mb-4">3. Registro de Cuenta</h2>
                    <p class="text-gray-700 mb-4">
                        Para realizar reservas o pedidos, es necesario crear una cuenta. Usted es responsable de mantener 
                        la confidencialidad de su información de inicio de sesión y de todas las actividades que ocurran 
                        bajo su cuenta.
                    </p>
                </section>

                <section class="mb-8">
                    <h2 class="text-2xl font-bold text-amber-800 mb-4">4. Cancelaciones y Reembolsos</h2>
                    <p class="text-gray-700 mb-4">
                        Las reservas pueden cancelarse hasta 2 horas antes de la hora programada. 
                        Los reembolsos están sujetos a nuestras políticas internas y pueden variar según el caso.
                    </p>
                </section>

                <section class="mb-8">
                    <h2 class="text-2xl font-bold text-amber-800 mb-4">5. Privacidad</h2>
                    <p class="text-gray-700 mb-4">
                        Respetamos su privacidad y protegemos sus datos personales de acuerdo con nuestra 
                        <a href="/privacidad" class="text-amber-600 hover:text-amber-700 underline">Política de Privacidad</a>.
                    </p>
                </section>

                <section class="mb-8">
                    <h2 class="text-2xl font-bold text-amber-800 mb-4">6. Modificaciones</h2>
                    <p class="text-gray-700 mb-4">
                        Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones 
                        entrarán en vigor inmediatamente después de su publicación en el sitio web.
                    </p>
                </section>

                <section class="mb-8">
                    <h2 class="text-2xl font-bold text-amber-800 mb-4">7. Contacto</h2>
                    <p class="text-gray-700">
                        Si tiene alguna pregunta sobre estos términos, por favor contáctenos en:
                    </p>
                    <ul class="list-disc pl-6 mt-2 text-gray-700">
                        <li>Email: info@restaurante.com</li>
                        <li>Teléfono: +1 234 567 890</li>
                        <li>Dirección: Calle Principal #123, Ciudad</li>
                    </ul>
                </section>

                <div class="mt-12 pt-6 border-t border-amber-100">
                    <p class="text-sm text-amber-600 text-center">
                        Al utilizar nuestro sitio web, usted reconoce que ha leído, entendido y aceptado estos términos y condiciones.
                    </p>
                </div>
            </div>
        </div>

        <div class="mt-8 text-center">
            <a 
                href="/" 
                class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
            >
                Volver al inicio
            </a>
        </div>
    </div>
</div>

<style>
    .prose {
        color: #374151; /* gray-700 */
    }
    .prose h2 {
        margin-top: 2rem;
        margin-bottom: 1rem;
    }
    .prose p {
        margin-bottom: 1rem;
        line-height: 1.6;
    }
    .prose ul {
        margin-bottom: 1rem;
    }
    .prose a:hover {
        text-decoration: none;
    }
</style>
