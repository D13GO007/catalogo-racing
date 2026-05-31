import { defineMiddleware } from 'astro:middleware';

const ROLES_VALIDOS = new Set(['admin', 'empleado']);
const RUTAS_PUBLICAS = ['/pos/login', '/pos/logout'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Permitir rutas públicas y assets
  if (RUTAS_PUBLICAS.includes(pathname) || !pathname.startsWith('/pos')) {
    return next();
  }

  const cookie = context.cookies.get('pr_session');
  const role = cookie?.value || '';

  // Sin sesión válida → login
  if (!ROLES_VALIDOS.has(role)) {
    return context.redirect('/pos/login');
  }

  // Empleados no pueden acceder a estadísticas
  if (role === 'empleado' && pathname.startsWith('/pos/estadisticas')) {
    return context.redirect('/pos/inicio');
  }

  context.locals.userRole = role as 'admin' | 'empleado';

  return next();
});
