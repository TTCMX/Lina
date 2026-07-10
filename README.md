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

## Notas

- El paso de pago es solo interfaz (sin procesador de pagos real todavía).
- No hay backend: las reservas y el formulario de contacto viven solo en el estado del navegador.
- Precios, depósito (%) y disponibilidad de recolección en taller están en `src/config.js` y `src/data/services.js`.
