import dotenv from 'dotenv';
import sql from './config/database'; // Asegúrate de que esta sea la configuración de @neondatabase/serverless

dotenv.config();

(async () => {
  try {
    // Prueba de conexión
    const result = await sql`SELECT version()`;
    console.log('Conexión exitosa a Neon. Versión de PostgreSQL:', result[0].version);

    // Aquí inicias tu servidor Express
    const app = require('./app').default;
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al conectar con la base de datos Neon:', error);
    process.exit(1); // Finaliza el proceso si no puede conectarse
  }
})();
