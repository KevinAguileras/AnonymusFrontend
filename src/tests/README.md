# Pruebas del frontend

Ejecutar `npm run test:coverage` desde AnonymusFrontend con Node 24 y Chrome/Chromium.
Jasmine y Karma simulan las respuestas HTTP; no se requieren credenciales ni AWS.
La guía completa de ejecución y alcance está en ../../INTEGRACION_AWS.md.

Se prueban los servicios REST, sesión y permisos, registro/login, perfil, CRUD de
productos, filtros del catálogo, carrito y confirmación de compra. Las pruebas
informativas anteriores se conservan. El checkout valida la confirmación del backend
antes de vaciar el carrito; no procesa pagos reales.

El reporte HTML queda en coverage/ dentro de la carpeta del navegador usado.
