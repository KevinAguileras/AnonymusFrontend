# Evidencia de integración con AWS — Anonymus

Fecha de verificación: 20-11-2026.

## 1. Qué se demuestra

El frontend React/Vite consume la API de Spring Boot desplegada contra MySQL en AWS RDS.
Los usuarios, roles, categorías, productos, stock y boletas se guardan en la nube.
El navegador nunca recibe la IP privada de RDS, claves AWS ni la contraseña MySQL.

```text
Navegador
  → http://localhost:5173/AnonymusFrontend/api/v1/...
  → proxy de Vite (API_PROXY_TARGET=http://127.0.0.1:8081)
  → Spring Boot con perfil aws (puerto 8081)
  → túnel SSH 127.0.0.1:13306
  → RDS MySQL (base tecnoshop)
```

## 2. Endpoints utilizados

| Método | Endpoint | Uso |
|---|---|---|
| POST | `/api/v1/auth/registro` | Crear cuenta (siempre CLIENTE) |
| POST | `/api/v1/auth/login` | Emitir JWT |
| GET | `/api/v1/cuenta` | Identidad y rol desde la base |
| GET/POST/PUT/DELETE | `/api/v1/categorias` | Categorías (escritura solo ADMIN) |
| GET/POST/PUT/DELETE | `/api/v1/productos` | Catálogo y stock (escritura solo ADMIN) |
| GET/POST | `/api/v1/boletas` | Compra académica e historial |
| GET/PUT | `/api/v1/admin/usuarios` | Administración de roles |

## 3. Inventario migrado a RDS

El catálogo local estaba en `src/data/productos.js` y `legacy/js/main.js`.
No se migraba automáticamente, por eso la página aparecía vacía al conectar con RDS.

Se creó `scripts/migrar_inventario.py` + `scripts/inventario.json`, que suben:

- 4 categorías: Notebooks, Periféricos, Monitores, Componentes.
- 19 productos con precio, oferta, precio anterior, imagen y stock inicial 20.
- Las rutas de imagen se guardan como `/images/...` y Vite las sirve desde `public/images/`.

El script es repetible: omite categorías y productos que ya existen.

```bash
ADMIN_EMAIL='correo-admin' ADMIN_PASSWORD='clave-admin' \
python3 scripts/migrar_inventario.py
```

## 4. Verificación de persistencia

Con el túnel abierto y el backend en 8081:

```bash
mysql -h 127.0.0.1 -P 13306 -u anonymusadmin -p \
  --ssl-mode=REQUIRED tecnoshop \
  -e "SELECT (SELECT COUNT(*) FROM usuarios) usuarios,
             (SELECT COUNT(*) FROM categorias) categorias,
             (SELECT COUNT(*) FROM productos) productos;"
```

Resultado observado: los datos siguen presentes después de reiniciar Spring Boot y recargar el navegador.

| Verificación | Confirmado |
|---|---|
| Registro/login desde la web | ✅ |
| Productos visibles en el catálogo | ✅ |
| Datos persistentes tras reiniciar backend | ✅ |
| Rol ADMINISTRADOR aplicado desde RDS | ✅ |
| Carrito sin confirmar permanece en localStorage | ✅ |

## 5. Evidencia a adjuntar en AVA

- [ ] Captura del catálogo con los productos migrados.
- [ ] Captura de Swagger en `http://localhost:8081/swagger-ui/index.html`.
- [ ] Captura de los contadores de RDS.
- [ ] Captura de los commits en GitHub (`main`).
- [ ] Captura de Trello con las tareas distribuidas (índice IE 3.3.2 de la rúbrica).

## 6. Commits en GitHub

- `AnonymusFrontend` → commit `cambios para poder integrar aws`.
- `AnonymusBackend` → commit `pequeños cambios`.
- `Anonymus` → commit `cambios en todo main`.

## 7. Cierre del laboratorio

Al finalizar la defensa: detener RDS, detener EC2, cerrar túneles y presionar **End Lab** en AWS Academy.
El frontend publicado en GitHub Pages no ejecuta el proxy de Vite; esta entrega corresponde a la demostración local con AWS.
