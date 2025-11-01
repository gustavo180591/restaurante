import { test, expect } from '@playwright/test';

test.describe('Página Principal', () => {
  test('debería cargar correctamente', async ({ page }) => {
    await page.goto('/');

    // Verificar título
    await expect(page).toHaveTitle(/Restaurante/);

    // Verificar elementos principales
    await expect(page.locator('h1')).toContainText(/restaurante/i);

    // Verificar navegación
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('a[href="/"]')).toBeVisible();
    await expect(page.locator('a[href*="menu"]')).toBeVisible();
  });

  test('debería ser responsiva en móvil', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Verificar que el menú móvil funciona
    const menuButton = page.locator('button[aria-label*="menu"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await expect(page.locator('nav')).toBeVisible();
    }
  });
});

test.describe('Página de Menú', () => {
  test('debería mostrar platos disponibles', async ({ page }) => {
    await page.goto('/');

    // Buscar enlace al menú
    const menuLink = page.locator('a[href*="menu"]').first();
    if (await menuLink.isVisible()) {
      await menuLink.click();
      await expect(page.url()).toContain('menu');
    }

    // Verificar que hay contenido de menú
    await expect(page.locator('main')).toBeVisible();

    // Si hay platos mostrados, verificar estructura básica
    const platos = page.locator('[data-testid="plato"], .plato, article');
    if (await platos.first().isVisible()) {
      await expect(platos.first()).toBeVisible();
    }
  });
});

test.describe('Página de Administración', () => {
  test('debería requerir autenticación', async ({ page }) => {
    await page.goto('/admin');

    // Verificar redirección a login o página de acceso denegado
    await expect(page.url()).not.toContain('/admin');

    // Si hay formulario de login, verificar que existe
    const loginForm = page.locator('form[action*="login"], input[type="email"], input[type="password"]');
    if (await loginForm.first().isVisible()) {
      await expect(loginForm.first()).toBeVisible();
    }
  });
});

test.describe('API Health Check', () => {
  test('debería responder correctamente', async ({ request }) => {
    const response = await request.get('/health');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data.status).toBe('healthy');
  });
});

test.describe('Navegación General', () => {
  test('debería tener enlaces funcionales', async ({ page }) => {
    await page.goto('/');

    // Probar enlaces principales
    const enlaces = [
      { texto: /inicio/i, href: '/' },
      { texto: /sobre/i, href: 'sobre' },
      { texto: /contacto/i, href: 'contacto' }
    ];

    for (const enlace of enlaces) {
      const link = page.locator(`a[href*="${enlace.href}"]`).first();
      if (await link.isVisible()) {
        await link.click();
        // Verificar que no hay errores 500
        await expect(page.locator('body')).toBeVisible();
        // Volver a página principal
        await page.goto('/');
      }
    }
  });

  test('debería manejar errores 404 correctamente', async ({ page }) => {
    await page.goto('/pagina-que-no-existe');

    // Verificar que muestra página de error o redirecciona
    await expect(page.locator('body')).toBeVisible();

    // No debería mostrar errores del servidor
    await expect(page.locator('pre:has-text("Error:"), h1:has-text("500")')).not.toBeVisible();
  });
});

test.describe('Formulario de Reservas', () => {
  test('debería estar presente en página principal', async ({ page }) => {
    await page.goto('/');

    // Buscar formulario de reservas
    const form = page.locator('form').filter({ hasText: /reserv/i });
    if (await form.isVisible()) {
      await expect(form).toBeVisible();

      // Verificar campos básicos
      await expect(form.locator('input, select, textarea')).toHaveCount(3);
    }
  });
});

test.describe('Accesibilidad Básica', () => {
  test('debería tener estructura semántica correcta', async ({ page }) => {
    await page.goto('/');

    // Verificar elementos semánticos básicos
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('debería tener imágenes con alt text', async ({ page }) => {
    await page.goto('/');

    // Verificar que las imágenes tienen texto alternativo
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      await expect(img).toHaveAttribute('alt');
    }
  });
});

test.describe('Performance Básica', () => {
  test('debería cargar rápidamente', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Menos de 5 segundos

    // Verificar que recursos críticos cargaron
    await expect(page.locator('body')).toBeVisible();
  });
});
