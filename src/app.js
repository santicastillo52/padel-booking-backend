
const express = require("express");
const cors = require("cors");
const userRoutes = require('./routes/users.routes.js'); 
const clubsRoutes = require('./routes/clubs.routes.js');
const bookingsRoutes = require('./routes/bookings.routes.js');
const courtSchedulesRoutes = require('./routes/courtsSchedules.routes.js');
const courtsRoutes = require('./routes/courts.routes.js');
const imagesRoutes = require('./routes/images.routes.js'); 
const loginRoutes = require('./routes/auth.routes.js');
const path = require('path');
const passport = require('passport');
const swaggerUI = require('swagger-ui-express');
const specs = require('./config/swagger.js');
require('./config/passport')(passport);

const app = express();

// meter en .env los url del back

// Middleware
app.use(express.json());
app.use(passport.initialize());
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

}));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(specs));

// Rutas
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use('/auth', loginRoutes);
app.use('/users',userRoutes);
app.use('/clubs', clubsRoutes);
app.use('/bookings', bookingsRoutes);
app.use('/schedules', courtSchedulesRoutes);
app.use('/courts',courtsRoutes);
app.use('/images',imagesRoutes);

module.exports = app;
