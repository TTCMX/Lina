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

## Notas

- El paso de pago es solo interfaz (sin procesador de pagos real todavía).
- No hay backend: las reservas y el formulario de contacto viven solo en el estado del navegador.
- Precios, depósito (%) y disponibilidad de recolección en taller están en `src/config.js` y `src/data/services.js`.
