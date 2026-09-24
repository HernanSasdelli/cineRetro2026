# Cine Retro 2026: venta de entradas online

Aplicación web para un cine de clásicos: cartelera, registro de clientes y panel de administración.
Trabajo Práctico 1: Programación IV, UTN FRA, 2026.

**Demo:** https://TU-APP.web.app

**Usuarios de prueba** (también disponibles como acceso rápido en el login):

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | admin@cine.com | admin123 |
| Cliente | cliente@cine.com | cliente123 |

## Stack

- **Angular 21:** componentes standalone, signals, control flow (`@if`, `@for`, `@let`), formularios reactivos, lazy loading.
- **Supabase:** autenticación, base de datos PostgreSQL y Row Level Security.
- **Firebase Hosting:** despliegue.
- **PWA:** aplicación instalable.

## Cómo correrlo localmente

1. `npm install`
2. Crear un proyecto en Supabase y ejecutar `supabase.sql` en el SQL Editor.
3. Completar `src/environments/environment.ts` con la URL y la publishable key del proyecto.
4. `ng serve -o`

## Arquitectura

```
src/app/
  core/       modelos, servicios (Supabase, auth, películas) y guards
  shared/     pipes reutilizables (duración, búsqueda)
  layout/     header de la aplicación
  features/   una carpeta por funcionalidad, cargadas con lazy loading
    cartelera/
    auth/       login y registro
    perfil/
    admin/      panel y ABM de películas (rutas hijas propias)
```

- Cada ruta carga su componente recién cuando se visita, así un cliente nunca descarga el código del panel de administración.
- Los componentes solo manejan la vista; el acceso a datos está en los servicios de `core`.

## Decisiones técnicas

**Seguridad en tres capas** REVISAR!
1. **RLS en Supabase (seguridad real):** las policies definen quién puede leer o modificar cada tabla. Aunque alguien llame a la API directamente, un usuario sin rol admin no puede crear ni editar películas.
2. **Guards (control de navegación):** `authGuard` exige sesión iniciada; `rolGuard` verifica el rol recibido por `data` de la ruta.
3. **`@if` en los templates (visibilidad):** oculta opciones que el usuario no puede usar.

**Autenticación**
- El `AuthService` expone el estado con signals (`usuario`, `perfil`, `logueado`, `rol`).
- La sesión de Supabase se recupera de forma asíncrona. Los guards esperan la promesa `listo` antes de decidir, para que recargar la página en una ruta protegida no redirija al login.
- El perfil lo crea un trigger en la base de datos al registrarse el usuario. Así la creación es atómica: no puede existir un usuario sin perfil.
- La key del frontend es la publishable key de Supabase, pública por diseño. La seguridad la da la RLS.

**Modelo de datos** ver
- Géneros como relación N a N (`pelicula_genero`): una película puede tener varios.
- El formato (2D, 3D, 4D, 5D) y el idioma pertenecen a la función, no a la película: la misma película puede darse en 2D castellano y en 3D subtitulada.
- Las películas no se borran: se ocultan (baja lógica), porque van a tener funciones y entradas vendidas asociadas cuyo historial no puede perderse.

**Interfaz** LIsto
- Estilo visual propio de "ticket impreso", con tokens SCSS (paleta, tipografías, espaciados) y sin librerías de componentes.
- Por pedido del cliente, no se usan calendarios ni listas con mucho scroll: la fecha de nacimiento se ingresa en tres campos con validación propia, y las opciones cortas se eligen con chips.
- Pipes propios: `duracion` (minutos a "2h 05m") y `buscar` (filtro por texto y género). El pipe puro solo se recalcula cuando cambian sus parámetros.

**Datos personales** listo!
- El registro pide los datos solicitados por el cliente. El tipo de sangre es opcional por ser un dato de salud, considerado sensible por la Ley 25.326.

## Estado del proyecto

- [x] Registro, login y roles (cliente, empleado, admin)
- [x] Rutas protegidas por sesión y por rol
- [x] Cartelera con buscador y filtro por género
- [x] ABM de películas (alta, edición y baja lógica)
- [ ] Funciones con asignación automática de sala y validación de horarios
- [ ] Mapa de butacas en tiempo real (comunes, accesibles y VIP)
- [ ] Compra, PDF y código QR
- [ ] Validación de QR por empleados
- [ ] Candy bar y combos
- [ ] Cupones, puntos de fidelización y crédito por cancelación
- [ ] Preventa, sección "Próximamente" y alertas
- [ ] Reseñas y "Mis películas"
- [ ] Reportes, exportación a PDF/Excel, gráficos y log de actividad

Detalle de los requerimientos y las decisiones[REQUERIMIENTOS.md](REQUERIMIENTOS.md).