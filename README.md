# Padel Booking — Backend API

API REST para la gestión de clubes de pádel, canchas, horarios y reservas. Pensada para integrarse con un frontend (por defecto Angular en `http://localhost:4200`).

---

## Tabla de contenidos

1. [Descripción general](#descripción-general)
2. [Stack tecnológico](#stack-tecnológico)
3. [Arquitectura del proyecto](#arquitectura-del-proyecto)
4. [Requisitos previos](#requisitos-previos)
5. [Instalación y configuración](#instalación-y-configuración)
6. [Variables de entorno](#variables-de-entorno)
7. [Base de datos y migraciones](#base-de-datos-y-migraciones)
8. [Ejecución del servidor](#ejecución-del-servidor)
9. [Documentación interactiva (Swagger)](#documentación-interactiva-swagger)
10. [Autenticación y autorización](#autenticación-y-autorización)
11. [Modelo de datos](#modelo-de-datos)
12. [API — Endpoints](#api--endpoints)
13. [Tareas en segundo plano](#tareas-en-segundo-plano)
14. [Subida de archivos](#subida-de-archivos)
15. [Estructura de carpetas](#estructura-de-carpetas)
16. [Convenciones y buenas prácticas](#convenciones-y-buenas-prácticas)

---

## Descripción general

El backend permite:

- **Registro e inicio de sesión** de usuarios con JWT.
- **Gestión de clubes** (datos, imágenes) por propietarios (`admin`).
- **Gestión de canchas** y sus **horarios semanales** (`CourtSchedule`).
- **Reservas** (`Booking`) vinculadas a cancha, horario, fecha y club.
- **Imágenes** asociadas a clubes o canchas, servidas desde `/uploads`.
- **Actualización automática** del estado de reservas finalizadas y **limpieza** de imágenes huérfanas en disco.

Los roles principales son:

| Rol     | Descripción |
|---------|-------------|
| `client` | Jugador que reserva canchas. Valor por defecto al registrarse. |
| `admin`  | Propietario de un club. Gestiona club, canchas, horarios y ve reservas de su club. |

---

## Stack tecnológico

| Tecnología | Uso |
|------------|-----|
| **Node.js** | Runtime |
| **Express 5** | Servidor HTTP y enrutamiento |
| **PostgreSQL** | Base de datos |
| **Sequelize 6** | ORM y migraciones (`sequelize-cli`) |
| **Passport** (Local) | Validación de credenciales en login |
| **jsonwebtoken** | Tokens JWT (expiración: 2 horas) |
| **bcrypt** | Hash de contraseñas |
| **Joi** | Validación de entrada en middleware |
| **Multer** | Subida de imágenes (memoria o disco) |
| **Swagger (swagger-jsdoc + swagger-ui-express)** | Documentación OpenAPI |
| **express-rate-limit** | Límite de intentos de login |
| **Luxon** | Fechas/horas para jobs y reservas |
| **CORS** | Origen permitido: frontend en puerto 4200 |

---

## Arquitectura del proyecto

El código sigue una separación por capas:

```
Petición HTTP
    → routes/        (rutas + anotaciones Swagger)
    → middlewares/   (JWT, permisos, Joi, rate limit)
    → controllers/   (req/res, códigos HTTP)
    → services/      (lógica de negocio)
    → providers/     (acceso a BD y utilidades)
    → models/        (Sequelize + asociaciones)
```

El punto de entrada es `index.js`, que autentica la conexión a PostgreSQL, arranca los servicios programados y levanta la app definida en `src/app.js`.

---

## Requisitos previos

- **Node.js** 18+ (recomendado LTS)
- **npm**
- Instancia de **PostgreSQL** accesible (local o en la nube; la configuración actual usa **SSL**)
- Carpeta `uploads/` en la raíz del proyecto (para archivos estáticos de imágenes)

---

## Instalación y configuración

```bash
# Clonar el repositorio y entrar al directorio
cd Padel-Booking-Backend

# Instalar dependencias
npm install

# Crear archivo de entorno (ver sección siguiente)
# Copiar y completar .env en la raíz del proyecto

# Ejecutar migraciones (requiere DATABASE_URL configurada)
npx sequelize-cli db:migrate

# Arrancar en desarrollo (nodemon)
npm start

# Arrancar en producción
npm run start-prod
```

Por defecto el servidor escucha en el puerto definido en `PORT` o **3000**.

---

## Variables de entorno

Crear un archivo `.env` en la raíz (está en `.gitignore`). Variables utilizadas en el código:

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `DATABASE_URL` | Sí | URL de conexión PostgreSQL (ej. `postgres://user:pass@host:5432/dbname`) |
| `JWT_SECRET` | Recomendada | Secreto para firmar JWT. Si no se define, se usa un valor por defecto **no seguro para producción**. |
| `PORT` | No | Puerto del servidor (default: `3000`) |
| `API_URL` | No | URL base para Swagger (default: `http://localhost:3000`) |

**Ejemplo de `.env`:**

```env
DATABASE_URL=postgres://usuario:password@localhost:5432/padel_booking
JWT_SECRET=tu_secreto_largo_y_aleatorio
PORT=3000
API_URL=http://localhost:3000
```

> La conexión en `src/config/database.js` y `config/config.js` exige SSL (`rejectUnauthorized: false`), típico de proveedores como Railway, Render o Supabase.

---

## Base de datos y migraciones

Las migraciones están en `migrations/` y crean, en orden:

1. `Users`
2. `Clubs`
3. `Courts`
4. `CourtSchedules`
5. `Bookings`
6. `Images`

**Comandos útiles (sequelize-cli):**

```bash
# Aplicar migraciones
npx sequelize-cli db:migrate

# Revertir la última migración
npx sequelize-cli db:migrate:undo

# Revertir todas
npx sequelize-cli db:migrate:undo:all
```

La configuración de Sequelize CLI está en `config/config.js` (entorno `development` usando `DATABASE_URL`).

Los modelos Sequelize viven en `src/models/` y las asociaciones se registran automáticamente en `src/models/index.js`.

---

## Ejecución del servidor

| Script | Comando | Descripción |
|--------|---------|-------------|
| Desarrollo | `npm start` | `nodemon index.js` — recarga al guardar cambios |
| Producción | `npm run start-prod` | `node index.js` |

Al iniciar correctamente verás en consola:

- Confirmación de conexión a la base de datos.
- Inicio del job de estados de horarios (cada 30 minutos).
- Inicio del job de limpieza de imágenes (cada semana).
- Mensaje con el puerto en escucha.

**Health check simple:** `GET /` → respuesta `Hello World!`

---

## Documentación interactiva (Swagger)

Con el servidor en marcha:

**URL:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

La especificación OpenAPI se genera desde comentarios `@swagger` en `src/routes/*.js`. El servidor documentado usa `API_URL` o `http://localhost:3000`.

> En varios endpoints Swagger referencia `bearerAuth`; asegúrate de enviar el token en las peticiones protegidas (ver siguiente sección).

---

## Autenticación y autorización

### Registro

`POST /auth/register` — Crea usuario con rol `client` por defecto. Campos validados con Joi:

- `name`, `last_name`, `email`, `password` (mín. 6 caracteres)
- `position`: `backhand` | `forehand` | `both`
- `level`: entero 1–8
- `gender`: `male` | `female` | `unspecified`

Respuesta exitosa (`201`): mensaje, **token JWT** y datos del usuario.

### Login

`POST /auth/login` — Body: `email`, `password`.

- Protegido con **rate limit**: máximo **5 intentos cada 15 minutos** por IP.
- Respuesta (`200`): `{ success, message, token, user: { id, name, role } }`.

### Uso del token

En rutas protegidas, enviar cabecera:

```http
Authorization: Bearer <token>
```

El middleware `authMiddleware.js` decodifica el payload en `req.user` (`id`, `name`, `role`, etc.). El token expira en **2 horas**.

### Reglas de permisos (resumen)

| Recurso | Cliente (`client`) | Admin / propietario (`admin`) |
|---------|-------------------|-------------------------------|
| Perfil propio | Ver/editar solo su `id` | Igual |
| Listado de usuarios | Con JWT | Con JWT |
| Club `/clubs/me` | No (403) | Sí, si tiene club asociado |
| Crear club | Con JWT | Con JWT |
| Canchas / horarios / imágenes del club | Según ownership del club | Solo recursos de **su** club |
| Reservas | Ver y modificar las propias | Ver/modificar reservas de **su** club |
| Listar clubes públicos | Sin JWT en `GET /clubs` | — |

Los middlewares relevantes están en:

- `src/middlewares/authMiddleware.js` — JWT
- `src/middlewares/userCheckMdw.js` — propiedad del perfil
- `src/middlewares/adminCheckMdw.js` — propiedad de club, cancha, horario, imagen
- `src/middlewares/bookingCheckMdw.js` — propiedad de reserva o admin del club

---

## Modelo de datos

### Diagrama de relaciones (simplificado)

```
User 1 ──< Club 1 ──< Court 1 ──< CourtSchedule
  │              │         │
  │              │         └──< Image (type: court)
  │              └──< Image (type: club)
  │
  └──< Booking >── Court, CourtSchedule, Club
```

### Entidades

#### User (`Users`)

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | INTEGER | PK |
| `name`, `last_name` | STRING | |
| `email` | STRING | Único |
| `password` | STRING | Hash bcrypt |
| `role` | ENUM | `admin`, `client` (default: `client`) |
| `position` | ENUM | `backhand`, `forehand`, `both` |
| `level` | INTEGER | 1–8 |
| `gender` | ENUM | `male`, `female`, `unspecified` |

Sin timestamps en BD.

#### Club (`Clubs`)

| Campo | Tipo |
|-------|------|
| `name`, `address`, `phone`, `email` | STRING |
| `UserId` | INTEGER → propietario |

#### Court (`Courts`)

| Campo | Tipo |
|-------|------|
| `name` | STRING |
| `wall_type` | `acrylic` \| `cement` |
| `court_type` | `indoor` \| `outdoor` |
| `available` | BOOLEAN (default: true) |
| `clubId` | INTEGER → Club |

#### CourtSchedule (`CourtSchedules`)

| Campo | Tipo |
|-------|------|
| `day_of_week` | `monday` … `sunday` |
| `start_time`, `end_time` | TIME |
| `courtId` | INTEGER |
| `status` | `available` \| `booked` \| `maintenance` |

#### Booking (`Bookings`)

| Campo | Tipo |
|-------|------|
| `date` | DATEONLY |
| `userId`, `courtId`, `courtScheduleId`, `clubId` | INTEGER |
| `status` | `pending` \| `confirmed` \| `cancelled` \| `completed` |
| `createdAt`, `updatedAt` | timestamps Sequelize |

Al crear una reserva, el horario pasa a `booked`. Un job periódico marca reservas terminadas como `completed` y libera el horario (`available`).

#### Image (`Images`)

| Campo | Tipo |
|-------|------|
| `url` | STRING (ruta bajo `/uploads/...`) |
| `type` | `court` \| `club` |
| `CourtId`, `ClubId` | INTEGER (según tipo) |

---

## API — Endpoints

Prefijo base: raíz del servidor (ej. `http://localhost:3000`).

### Auth — `/auth`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/login` | No | Inicio de sesión (rate limited) |
| POST | `/auth/register` | No | Registro de usuario |

### Users — `/users`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/users` | JWT | Listar usuarios (filtros query opcionales) |
| GET | `/users/:id` | JWT | Usuario por ID |
| PATCH | `/users/:id` | JWT + propietario | Actualizar perfil propio |

### Clubs — `/clubs`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/clubs` | No | Listar clubes (`name`, `location`, `id` en query) |
| GET | `/clubs/dropdown` | No | Lista `{ id, name }` para selectores |
| GET | `/clubs/me` | JWT + `admin` | Club del usuario autenticado |
| GET | `/clubs/:id` | JWT | Detalle de un club |
| POST | `/clubs` | JWT | Crear club (`multipart/form-data`, campo `images`) |

### Courts — `/courts`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/courts` | JWT + ownership | Listar canchas (filtros: `name`, `wall_type`, `court_type`, `clubId`) |
| GET | `/courts/available` | JWT | Canchas con horarios disponibles (filtros de día/hora/club/tipo) |
| GET | `/courts/:id` | JWT | Cancha por ID |
| POST | `/courts` | JWT + dueño del club | Crear una o varias canchas (`multipart`, imágenes opcionales) |
| PATCH | `/courts/:id` | JWT + ownership | Editar cancha |
| DELETE | `/courts/:id` | JWT + ownership | Eliminar cancha |

### Schedules — `/schedules`

> En Swagger algunos comentarios dicen `/courts-schedules`; la ruta montada en la app es **`/schedules`**.

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/schedules` | No | Todos los horarios |
| POST | `/schedules/:id` | JWT + ownership | Crear horarios para la cancha `:id` (body: array `schedules`) |
| DELETE | `/schedules/:id` | JWT + ownership | Eliminar horario por ID del schedule |

**Ejemplo de cuerpo para crear horarios:**

```json
{
  "schedules": [
    {
      "day_of_week": "monday",
      "start_time": "09:00",
      "end_time": "10:00"
    }
  ]
}
```

### Bookings — `/bookings`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/bookings` | JWT | Listar reservas (`status` opcional). Admin: reservas de su club. Client: las propias. |
| POST | `/bookings` | JWT | Crear reserva |
| PATCH | `/bookings/:id` | JWT + ownership/admin club | Actualizar estado |
| DELETE | `/bookings/:id` | JWT + ownership/admin club | Eliminar reserva |

**Cuerpo crear reserva (`POST /bookings`):**

```json
{
  "courtId": 1,
  "courtScheduleId": 1,
  "clubId": 1,
  "date": "2025-06-15",
  "status": "pending"
}
```

Estados válidos: `pending`, `confirmed`, `cancelled`, `completed`.

**Reglas de negocio al reservar:**

- El horario debe existir y no estar `booked` ni en `maintenance`.
- No puede haber otra reserva `pending` o `confirmed` para el mismo horario y fecha.

### Images — `/images`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/images` | No | Listar todas las imágenes |
| PATCH | `/images/:id` | JWT + ownership | Actualizar imagen (`multipart/form-data`: `image`, `type`, `clubId`/`courtId`) |

Archivos estáticos: `GET /uploads/<nombre_archivo>`.

### CORS

Configurado en `src/app.js` para:

- **Origen:** `http://localhost:4200`
- **Métodos:** GET, POST, PUT, PATCH, DELETE

Para otro frontend, ajustar el `origin` en ese archivo o externalizarlo a variable de entorno.

---

## Tareas en segundo plano

Definidas en `index.js` al arrancar el servidor:

### 1. Actualización de estados de reservas (`courtScheduleStatus.service.js`)

- **Frecuencia:** cada **30 minutos** (y una ejecución al inicio).
- **Acción:** busca reservas cuya fecha/hora de fin ya pasó; pone el `CourtSchedule` en `available` y el `Booking` en `completed`.

### 2. Limpieza de imágenes huérfanas (`images.services.js`)

- **Frecuencia:** cada **7 días** (y una ejecución al inicio).
- **Acción:** compara archivos en `uploads/` con URLs registradas en BD; elimina del disco los que no tienen registro.

---

## Subida de archivos

- Configuración: `src/config/multer.js`.
- Rutas que aceptan archivos usan **`uploadMemory`** (buffer en memoria); el servicio escribe en `uploads/` con nombre `timestamp_originalname`.
- Tipos de imagen en BD: `court` o `club`, asociados por `CourtId` o `ClubId`.
- Las URLs guardadas tienen forma `/uploads/<archivo>` y se sirven como estáticos bajo el mismo path.

---

## Estructura de carpetas

```
Padel-Booking-Backend/
├── config/
│   └── config.js              # Config Sequelize CLI
├── migrations/                # Migraciones de BD
├── uploads/                   # Imágenes subidas (no versionar datos sensibles)
├── index.js                   # Entrada: BD + jobs + listen
├── package.json
└── src/
    ├── app.js                 # Express, CORS, rutas, Swagger
    ├── config/
    │   ├── database.js
    │   ├── multer.js
    │   ├── passport.js
    │   └── swagger.js
    ├── controllers/
    ├── middlewares/
    ├── models/
    ├── providers/             # Acceso a datos
    ├── routes/                # Rutas + Swagger JSDoc
    ├── schemas/               # Esquemas Joi
    ├── services/              # Lógica de negocio + jobs
    └── utils/
```

---

## Convenciones y buenas prácticas

- Cada función exportada debe documentarse con **bloque JSDoc** (convención del repositorio).
- Validación de entrada centralizada con **Joi** (`validatorJoiMdw.js`).
- Respuestas de error suelen incluir `message` y, en muchos casos, `error` con código simbólico (`FORBIDDEN_ACCESS`, `EMAIL_DUPLICATE`, etc.).
- No commitear `.env` ni secretos reales.
- En **producción**: definir `JWT_SECRET` fuerte, revisar CORS, usar HTTPS delante del API y considerar almacenamiento de imágenes en object storage si escala el tráfico.

---

## Scripts npm

| Script | Acción |
|--------|--------|
| `npm start` | Desarrollo con nodemon |
| `npm run start-prod` | Producción con node |
| `npm test` | No configurado (placeholder) |

---

## Licencia

ISC (según `package.json`).

---

## Soporte y ampliación

Para detalle de parámetros, cuerpos y respuestas de cada endpoint, usar **Swagger** en `/api-docs`. Para cambios en el esquema de BD, crear nuevas migraciones con `sequelize-cli` y mantener modelos en `src/models/` alineados con las tablas.
