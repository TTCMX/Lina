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

## Pagos (Mercado Pago Checkout Pro)

Al llegar al paso de pago, el cliente es redirigido a Mercado Pago para pagar con tarjeta (OXXO, transferencia y otros métodos que no confirman al instante están desactivados a propósito). La reserva se guarda como `pending_payment` (apartando el horario) *antes* de mandarlo a pagar, y Mercado Pago le pega a un webhook (`api/payments/webhook.js`) cuando el pago se resuelve — ahí es donde de verdad se confirma la reserva y se mandan los correos, nunca confiando en la redirección del navegador sola.

**Configuración en Mercado Pago** (usando la cuenta que ya tienen en otro proyecto):

1. Entra a [mercadopago.com.mx/developers](https://www.mercadopago.com.mx/developers/panel) con esa cuenta.
2. **Tus integraciones → Crear aplicación** — crea una aplicación nueva, ej. "Lina" (esto le da credenciales y configuración de webhook propias a este proyecto, aunque el dinero llega a la misma cuenta de siempre).
3. En esa aplicación, copia el **Access Token de producción** → variable `MP_ACCESS_TOKEN`.
4. En la misma aplicación, ve a **Webhooks**, agrega la URL `https://tudominio.com/api/payments/webhook`, suscríbete al evento `payments`, y copia la **clave secreta** que te da → variable `MP_WEBHOOK_SECRET`.

Variables de entorno en Vercel:

| Variable | Qué va ahí |
|---|---|
| `MP_ACCESS_TOKEN` | Access token de producción de la aplicación de Mercado Pago |
| `MP_WEBHOOK_SECRET` | Clave secreta del webhook (Mercado Pago → esa aplicación → Webhooks) |
| `SITE_URL` | URL completa del sitio en producción, ej. `https://linahome.pro` (sin `/` al final) — se usa para armar las URLs de retorno y el webhook |

Correr `supabase/migrations/0004_mercadopago_payments.sql` en Supabase antes de usar esto (agrega el estado `pending_payment` y columnas para guardar el id de pago/preferencia de Mercado Pago).

**Importante — es dinero real desde el día uno** (se configuró así a propósito, sin modo prueba): antes de compartir el link con clientes, haz tú mismo una reserva de principio a fin con una tarjeta real para confirmar que todo el flujo funciona — el correo de confirmación llega, el back office lo muestra como "Confirmada", etc.

**Limitación conocida:** si un cliente llega hasta la pantalla de pago y abandona sin pagar (cierra la pestaña, no completa la tarjeta), esa reserva se queda en `pending_payment` y el horario sigue apartado indefinidamente — no hay limpieza automática todavía. Desde el back office puedes cancelarla manualmente para liberar el horario (filtro "Pago pendiente").

## Cupones de descuento

Desde `/admin` → pestaña **Cupones** puedes crear códigos de porcentaje (ej. 10%) o monto fijo (ej. $100), con límite de usos y/o fecha de expiración opcionales. En el paso de pago del wizard, el cliente puede meter un código antes de pagar.

El descuento se calcula y se "cobra" (redime) en el servidor cuando se crea la reserva — nunca se confía en el monto que mande el navegador. Si después la reserva se cancela (el cliente no completa el pago, se cancela desde el back office, etc.), el cupón se libera automáticamente y su uso vuelve a estar disponible.

Correr `supabase/migrations/0005_coupons.sql` en Supabase antes de usar esto.

## Notas

- Precios, depósito (%) y disponibilidad de recolección en taller están en `src/config.js` y `src/data/services.js`.
