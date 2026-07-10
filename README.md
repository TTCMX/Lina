# Lina

Sitio web para Lina, servicio de lavado y mantenimiento a domicilio de tapetes, colchones y salas.

Implementado en React + Vite a partir de un diseño exportado de Claude Design (ver `design/`).

## Páginas

- **Home** — hero, servicios, cómo funciona, testimonio, CTA
- **Servicios** — catálogo con tamaños y precios
- **Nosotros** — historia y valores
- **Contacto** — datos de contacto + formulario
- **Agendar** — wizard de reservación en 5 pasos (servicio → tamaño/cantidad → fecha/hora → dirección → pago) con confirmación

## Desarrollo

```bash
npm install
npm run dev
```

## Deploy (Vercel + dominio en Hostinger)

1. En [vercel.com](https://vercel.com), **Add New → Project**, importa `TTCMX/Lina`.
2. Framework se detecta como Vite automáticamente (build `npm run build`, output `dist`). `vercel.json` ya trae el rewrite para que las rutas de React Router funcionen.
3. Deploy. Te da una URL tipo `lina.vercel.app`.
4. En el proyecto de Vercel → **Settings → Domains**, agrega tu dominio (ej. `lina.mx`).
5. Vercel te muestra los registros DNS a usar (típicamente un `A` a `76.76.21.21` para el dominio raíz y un `CNAME` a `cname.vercel-dns.com` para `www`).
6. En Hostinger → **hPanel → Dominios → DNS / Zona DNS**, agrega esos mismos registros (sin cambiar los nameservers, el dominio se queda administrado en Hostinger).
7. Espera la propagación (minutos a un par de horas) y Vercel emite el certificado SSL automáticamente.

## Notificaciones de reservas y contacto (Supabase + Resend)

Cuando alguien agenda un servicio o manda el formulario de contacto, el sitio llama a una función serverless de Vercel (`api/bookings.js`, `api/contact.js`) que:

1. Guarda el registro en Supabase (tablas `bookings` y `contact_messages`, ver `supabase/schema.sql` — córrelo una vez en el SQL editor del proyecto de Supabase).
2. Manda un correo de notificación vía Resend con los detalles.

Variables de entorno que hay que configurar en el proyecto de Vercel (**Settings → Environment Variables**), nunca en el código:

| Variable | Qué va ahí |
|---|---|
| `SUPABASE_URL` | URL del proyecto de Supabase (Settings → API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key de Supabase (Settings → API) — solo se usa server-side, nunca se expone al navegador |
| `RESEND_API_KEY` | API key de Resend |
| `NOTIFY_FROM_EMAIL` | Remitente de los correos, ej. `reservas@linahome.pro` (el dominio debe estar verificado en Resend) |
| `NOTIFY_TO_EMAIL` | A dónde llegan las notificaciones. Puede ser una o varias direcciones separadas por coma |

Después de agregarlas, haz un redeploy en Vercel para que tomen efecto.

## Back office (`/admin`)

Panel protegido por contraseña en `/admin` para ver todas las reservas y mensajes de contacto, y cancelar/completar/reagendar una reserva. No está enlazado desde la navegación pública — se entra escribiendo la URL directamente.

Variables de entorno adicionales:

| Variable | Qué va ahí |
|---|---|
| `ADMIN_PASSWORD` | La contraseña para entrar a `/admin` |
| `ADMIN_SESSION_SECRET` | Cualquier cadena larga y aleatoria (para firmar la sesión) — genera una con `openssl rand -hex 32` |

Al cancelar o reagendar una reserva desde el panel, se le manda un correo al cliente avisándole.

Correr `supabase/migrations/0003_booking_status_and_backoffice.sql` en el SQL editor de Supabase antes de usar el back office (agrega el campo de estado y hace que cancelar libere el horario).

## Notas

- El paso de pago es solo interfaz (sin procesador de pagos real todavía) — no se guarda ni se transmite el número de tarjeta a ningún lado.
- Precios, depósito (%) y disponibilidad de recolección en taller están en `src/config.js` y `src/data/services.js`.
