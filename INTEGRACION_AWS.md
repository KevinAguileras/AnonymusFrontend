# Frontend conectado al backend y RDS

La demostración recomendada ejecuta React con Vite en el computador y Spring Boot
con Run en IntelliJ. Spring Boot usa MySQL en RDS mediante el túnel SSH por EC2.
El navegador nunca recibe claves AWS, contraseñas MySQL ni el secreto de firma JWT.

## Comandos preparados en este computador

Se instalaron Node 24 y Chromium dentro de `.tools/`, excluido de Git, y las
 dependencias en `node_modules/`. Desde AnonymusFrontend puedes ejecutar:

```bash
bash ejecutar.sh dev
bash ejecutar.sh test:coverage -- --browsers ChromeHeadlessCI
bash ejecutar.sh build
```

El lanzador usa esas herramientas locales. En otro computador se debe instalar Node
24 y Chrome/Chromium; los ejecutables no se suben al repositorio. `ChromeHeadlessCI`
desactiva el sandbox del navegador para el entorno de pruebas aislado; no se usa para
navegar sitios externos. Para un equipo que soporte sandbox usar `test:coverage` sin
el argumento de launcher.

## Iniciar la demostración

1. Iniciar Learner Lab, EC2 y RDS. Esperar RDS disponible y consultar la IP pública
   actual de EC2. Puede cambiar después de detenerlo.
2. Abrir el túnel a RDS que ya utilizaste. Reemplazar IP y endpoint por los actuales:

```bash
ssh -i "$HOME/Descargas/labsuser.pem" -o ExitOnForwardFailure=yes -N \
  -L 127.0.0.1:13306:ENDPOINT_RDS:3306 ec2-user@IP_PUBLICA_EC2
```

3. En IntelliJ, recargar Maven después del cambio de `pom.xml`. Iniciar el backend
   actualizado con JDK 21, perfil `aws`, `SERVER_PORT=8081`, credenciales SQL,
   `JWT_SECRET` y las opciones del truststore configuradas anteriormente.
   La URL SQL sigue siendo `jdbc:mysql://127.0.0.1:13306/tecnoshop?sslMode=VERIFY_CA`.
   Mantener `SPRING_JPA_HIBERNATE_DDL_AUTO=validate`: esta integración no agrega tablas.
4. Verificar Swagger en http://localhost:8081/swagger-ui/index.html.
5. Usar Node 24 (el Node 18 del sistema no es compatible con este Vite). En la carpeta
   AnonymusFrontend, ejecutar:

```bash
npm ci
npm run dev
```

6. Abrir http://localhost:5173/AnonymusFrontend/.

Vite reenvía `/api` a `http://127.0.0.1:8081`. Para usar el backend de EC2 por el túnel
API, copiar `.env.example` a `.env.local`, cambiar `API_PROXY_TARGET` a
`http://127.0.0.1:8080` y reiniciar Vite. Primero se debe reinstalar en EC2 el JAR
actualizado, porque se agregó `/api/v1/cuenta`.

En IntelliJ puedes crear una configuración **npm**, seleccionar este `package.json`,
comando `run`, script `dev` y un intérprete Node 24. Mantenerla activa junto con Spring
Boot y el túnel. Si usas la edición sin soporte npm, utilizar la terminal del IDE.

## Qué se guarda

Usuarios, nombres de perfil, roles, categorías, productos, stock, boletas y detalles
se leen/escriben mediante la API en RDS. El servidor determina precios, totales y
permisos. El carrito aún sin confirmar permanece en localStorage.

La sesión JWT y datos mínimos de usuario se mantienen en sessionStorage para sobrevivir
recargas en esa pestaña. Las contraseñas no se almacenan. Al iniciar sesión se eliminan
los registros de usuario antiguos que podían contener contraseñas del prototipo.
La API valida la firma y consulta el rol persistido en cada solicitud. Las páginas
protegidas consultan `/cuenta`; la comprobación de expiración del cliente no reemplaza
la validación del servidor. No hay renovación automática de tokens: al vencer hay
que volver a iniciar sesión. Un JWT en sessionStorage sigue expuesto si hay XSS;
este esquema no equivale a cookies HttpOnly.

Las imágenes permanecen como archivos del frontend o URLs: no se implementó carga a S3.
El checkout registra una compra académica; no procesa pagos reales ni guarda dirección
de despacho. Se retiraron los campos de entrega que antes se solicitaban pero no se
persistían. El catálogo está basado en RDS: ya no se mezcla con productos de prueba locales.
Los antiguos productos de localStorage no se migran automáticamente.

## Primer administrador y catálogo inicial

El registro público siempre crea CLIENTE. No se puede crear un administrador indicando
un rol en el formulario. Si aún no existe administrador, el responsable de la base debe
promover una cuenta de prueba ya registrada, usando un cliente SQL autorizado conectado
al túnel RDS (host 127.0.0.1, puerto 13306). Ejecutar cambiando el correo del ejemplo:

```sql
SELECT id, email, rol FROM usuarios WHERE email = 'correo-del-administrador@example.test';
UPDATE usuarios SET rol = 'ADMINISTRADOR' WHERE email = 'correo-del-administrador@example.test';
```

Confirmar que se actualizó solo la cuenta elegida. Cerrar sesión y volver a entrar.
En Admin crear una categoría y un producto con stock positivo. Todos los productos de
RDS se pueden administrar; ya no se utiliza la antigua regla `id > 19`.
Desde Usuarios, el administrador puede asignar roles. VENDEDOR puede consultar
productos y órdenes; CLIENTE solo puede ver sus propias compras. El backend sigue
siendo la autoridad aunque alguien manipule la interfaz.

## Comprobación de integración con AWS

Esta prueba es distinta de las pruebas unitarias y requiere el laboratorio activo:

1. Login con el usuario registrado anteriormente: debe conservar sus datos.
2. Con administrador crear categoría y producto; recargar y comprobar su permanencia.
3. Con cliente agregar ese producto al carrito y confirmar la compra.
4. Comprobar Mis compras y el detalle de la boleta; revisar que bajó el stock.
5. Reiniciar Spring Boot y volver a consultar los datos.
6. Intentar acceder a `/admin` como cliente: debe impedirlo. Vendedor debe ver las
   tablas sin formularios de edición. Un rechazo del backend también se muestra.
7. Detener temporalmente la API: el frontend debe mostrar error; no inventa datos ni
   anuncia una compra exitosa. Si falla una compra, conserva el carrito.

## Pruebas automatizadas

```bash
npm run test:coverage
npm run build
npm run lint
```

Jasmine/Karma usa un navegador Chrome/Chromium. Si no lo encuentra, indicar `CHROME_BIN`
con su ruta. En un entorno CI aislado puede utilizarse `-- --browsers ChromeHeadlessCI`.
Las pruebas simulan fetch y no escriben en AWS. Reporte: `coverage/`, buscar `index.html`
dentro de la carpeta del navegador. Se conservan las pruebas del carrito y las páginas
informativas, y se adaptan las del catálogo al flujo asíncrono.

Casos: credenciales incorrectas, correo duplicado, fallo de red, persistencia de sesión
sin contraseña, JWT vencido, verificación de rol desde la API, CRUD, filtros, checkout
con IDs/cantidades, carrito conservado si falta stock y bloqueo del doble clic.

## Publicación y cierre

Esto conecta el frontend local con RDS a través del backend; no publica la aplicación
completa en Internet. GitHub Pages no ejecuta el proxy de Vite ni accede al túnel privado.
Para publicar se necesita una API accesible por HTTPS, configurar `VITE_API_URL` antes
de compilar y autorizar el origen exacto en CORS. No poner RDS público para resolverlo.

Al terminar: detener Vite y Spring Boot, cerrar los túneles, detener EC2 y RDS y luego
End Lab. Verificar estados: cerrar el navegador no detiene necesariamente RDS.

Referencias: [proxy Vite](https://vite.dev/config/server-options#server-proxy),
[ejecución npm en IntelliJ](https://www.jetbrains.com/help/idea/run-debug-configuration-npm.html).

## Cierre de la integración (20-11-2026)

El inventario local no aparecía al conectar con RDS porque el catálogo dejó de leer
`src/data/productos.js`/`localStorage` y pasó a leer solo la API. Para migrarlo se agregó
`scripts/inventario.json` y `scripts/migrar_inventario.py`, que crean 4 categorías y
suben 19 productos con imagen, oferta y stock inicial 20. Es repetible: omite lo que
ya existe.

```bash
ADMIN_EMAIL='correo-admin' ADMIN_PASSWORD='clave-admin' \
python3 scripts/migrar_inventario.py
```

La primera cuenta administradora se promueve desde MySQL, nunca desde el formulario
público:

```bash
mysql -h 127.0.0.1 -P 13306 -u anonymusadmin -p \
  --ssl-mode=REQUIRED tecnoshop \
  -e "UPDATE usuarios SET rol='ADMINISTRADOR' WHERE email='correo-admin';
      SELECT email, rol FROM usuarios WHERE email='correo-admin';"
```

Checklist final y evidencia: [EVIDENCIA.md](EVIDENCIA.md).
