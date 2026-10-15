# FlexEnergy — demo local

Prueba navegable de la app real, con datos ficticios y sin backend ni servicios externos.

## Arranque

- Con las dependencias instaladas: `pnpm dev` (puerto 3020).
- Compilar: `pnpm build`. Servir la compilación localmente: `pnpm preview`.
- Pruebas: `pnpm test`.
- No necesita `.env`, credenciales, VPN ni acceso a la API.

La instalación inicial de dependencias puede necesitar internet. Después, la app
se sirve desde el equipo local y no necesita conexión a internet. No es una PWA:
necesita el servidor local para abrirse o recargar, no un backend de datos.

## Datos y comportamiento

- `src/demo/data.json`: usuario, tres contratos, movimientos, consumos y tarifas.
- Fechas relativas para que la demo tenga datos recientes cada vez que se reinicia.
- Recargas individuales y de carrito simuladas: actualizan saldos e historial.
- Perfil, nombres de contratos, avisos y notificaciones editables localmente.
- Facturas y recibos PDF generados en memoria, marcados como DEMO.
- Fuente, imágenes y vídeos incluidos localmente; sin Google Fonts ni CDN.
- Login simulado: **Sign in** entra siempre, con cualquier dato o campos vacíos.
- Google también es simulado; login, recuperación y verificación no envían nada.
- Nunca se cobra dinero ni se guardan los datos de tarjeta introducidos.

Los cambios se guardan en `localStorage`, clave `flex_energy_demo_v1`.
**Reset demo** restaura el JSON inicial, sin borrar las preferencias de idioma o tema.
No introducir datos personales ni tarjetas reales.

## Aislamiento

La app utiliza exclusivamente `src/demo/client.ts`; el SDK antiguo se conserva
como referencia y su transporte de red está deshabilitado. Las variables de API
no activan conexiones reales. No hay proxies a servidores externos.
La compilación añade una política de seguridad que bloquea conexiones de datos
(`connect-src 'none'`); en desarrollo solo permite el propio servidor de Vite.
Los documentos en `docs/` describen la app original, no requisitos de esta demo.