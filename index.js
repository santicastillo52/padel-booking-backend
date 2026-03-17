
require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/config/database');
const courtScheduleStatusService = require('./src/services/courtScheduleStatus.service');
const imagesService = require('./src/services/images.services');

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    
    // Inicializar el servicio automático de actualización de estados (cada 30 minutos)
    courtScheduleStatusService.startAutomaticStatusUpdate();
    
    //Inicializar el servicio automatico de eliminación de imagenes huerfanas (cada una semana)
    imagesService.startAutomaticImagesCleaner();

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

startServer();
