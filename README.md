# Padel Booking — Backend API

API REST para gestionar clubes de pádel, canchas, horarios y reservas. Pensada para integrarse con el frontend Angular.

### Deploys

| Entorno | URL |
|---------|-----|
| **Backend (API)** | [https://padel-booking-backend.onrender.com/](https://padel-booking-backend.onrender.com/) |
| **Frontend** | [https://padel-booking-frontend-navy.vercel.app/](https://padel-booking-frontend-navy.vercel.app/) |
| **Swagger** | [https://padel-booking-backend.onrender.com/api-docs](https://padel-booking-backend.onrender.com/api-docs) |

> En Render (plan free) la primera request puede tardar si el servicio estaba dormido.

---

## Qué hace

- Registro e inicio de sesión con **JWT** (expira en 2 h).
- Gestión de **clubes**, **canchas** y **horarios semanales**.
- **Reservas** vinculadas a cancha, horario, fecha y club.
- **Imágenes** en Cloudinary (URL + `public_id`).
- Job periódico que marca reservas finalizadas como `completed` y libera el horario.

| Rol | Quién | Qué puede hacer |
|-----|--------|-----------------|
| `client` | Jugador (default al registrarse) | Reservar, ver/cancelar sus reservas, editar su perfil |
| `admin` | Dueño de club | Gestionar canchas, horarios, imágenes y reservas de su club |

---

## Stack

| Tecnología | Uso |
|------------|-----|
| Node.js + Express 5 | API HTTP |
| PostgreSQL + Sequelize 6 | Persistencia y migraciones |
| Passport + JWT + bcrypt | Auth |
| Joi | Validación de entrada |
| Multer + Cloudinary | Subida y hosting de imágenes |
| Swagger | Documentación OpenAPI |
| Luxon | Fechas/horas del job de reservas |
| express-rate-limit | Límite de intentos de login |

---

## Arquitectura

```
HTTP → routes → middlewares → controllers → services → providers → models
```

Entrada: `index.js` (conexión a BD, jobs, listen). App Express: `src/app.js`.

---

## Arranque rápido

Requisitos: Node.js 18+, PostgreSQL, cuenta Cloudinary.

```bash
cd Padel-Booking-Backend
npm install
# Crear .env (ver abajo)
npx sequelize-cli db:migrate
npm start          # desarrollo (nodemon) → puerto 3000
npm run start-prod # producción
```

Health check: `GET /` → `Hello World!`  
Docs locales: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### Variables de entorno

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `DATABASE_URL` | Sí | Conexión PostgreSQL (SSL habilitado) |
| `JWT_SECRET` | Sí en prod | Secreto para firmar tokens |
| `PORT` | No | Default `3000` |
| `API_URL` | No | Base URL para Swagger |
| `FRONTEND_URL` | No | Orígenes CORS extra (separados por coma) |
| `CLOUDINARY_CLOUD_NAME` | Sí (imágenes) | Cloudinary |
| `CLOUDINARY_API_KEY` | Sí (imágenes) | Cloudinary |
| `CLOUDINARY_API_SECRET` | Sí (imágenes) | Cloudinary |

```env
DATABASE_URL=postgres://usuario:password@localhost:5432/padel_booking
JWT_SECRET=tu_secreto_largo_y_aleatorio
PORT=3000
API_URL=http://localhost:3000
FRONTEND_URL=https://otro-frontend.ejemplo.com
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### CORS

Orígenes permitidos por defecto:

- `http://localhost:4200`
- `https://padel-booking-frontend-navy.vercel.app`

Podés sumar más con `FRONTEND_URL`.

---

## Modelo de datos (resumen)

```
User 1 ──< Club 1 ──< Court 1 ──< CourtSchedule
  │              │         │
  │              │         └──< Image (court)
  │              └──< Image (club)
  └──< Booking >── Court, CourtSchedule, Club
```

- **Booking** `status`: `pending` | `confirmed` | `cancelled` | `completed`
- **CourtSchedule** `status`: `available` | `booked` | `maintenance`
- Al reservar, el horario pasa a `booked`. Un job cada **30 min** completa reservas vencidas y vuelve el horario a `available`.

Detalle de tablas y migraciones: carpeta `migrations/` y modelos en `src/models/`.

---

## API

Prefijos principales: `/auth`, `/users`, `/clubs`, `/courts`, `/schedules`, `/bookings`, `/images`.

El contrato completo (parámetros, bodies, respuestas) está en **Swagger** (`/api-docs`). En rutas protegidas:

```http
Authorization: Bearer <token>
```

Reglas clave al reservar:

- El horario no puede estar `booked` ni en `maintenance`.
- No puede haber otra reserva `pending`/`confirmed` para el mismo horario y fecha.
- Login: máximo 5 intentos cada 15 minutos por IP.

---

## Decisiones técnicas

- Capas separadas para aislar HTTP, validación, negocio y acceso a datos.
- Imágenes solo en Cloudinary (Multer en memoria); al borrar entidad se limpia el asset.
- Ownership por middlewares (`adminCheckMdw`, `bookingCheckMdw`), no solo por rol genérico.
- Job in-process cada 30 min (simple para el alcance del proyecto; en escala iría a un worker/cola).

---

## Estructura

```
Padel-Booking-Backend/
├── config/config.js       # Sequelize CLI
├── migrations/
├── index.js
└── src/
    ├── app.js
    ├── config/            # DB, Cloudinary, Multer, Passport, Swagger
    ├── controllers/
    ├── middlewares/
    ├── models/
    ├── providers/
    ├── routes/            # + anotaciones Swagger
    ├── schemas/           # Joi
    ├── services/
    └── utils/
```

---

## Scripts

| Script | Acción |
|--------|--------|
| `npm start` | Desarrollo con nodemon |
| `npm run start-prod` | Producción con node |

Licencia: ISC.
