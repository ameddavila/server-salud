import dotenv from "dotenv";
dotenv.config();

// 📌 Establecer la zona horaria global para el servidor
process.env.TZ = "America/La_Paz";
console.log(`🕒 Zona horaria configurada en: ${process.env.TZ}`);

import sql from "./config/database"; // Configuración de @neondatabase/serverless
import "./utils/renewApiKeyJob"; // Importar el cron job para renovar API keys automáticamente

const MAX_INTENTOS = 5;
const TIEMPO_ESPERA = 5000; // 5 segundos

const conectarBaseDeDatos = async (intentos = MAX_INTENTOS) => {
  while (intentos > 0) {
    try {
      // Prueba de conexión
      const result = await sql`SELECT version()`;
      console.log(
        "✅ Conexión exitosa a Neon. Versión de PostgreSQL:",
        result[0].version
      );
      return true;
    } catch (error) {
      console.error(
        `❌ Intento ${MAX_INTENTOS - intentos + 1} fallido:`,
        error
      );
      intentos--;
      if (intentos === 0) {
        console.error("🚨 No se pudo conectar después de varios intentos.");
        process.exit(1); // Finaliza el proceso si no puede conectarse
      }
      await new Promise((res) => setTimeout(res, TIEMPO_ESPERA));
    }
  }
};

(async () => {
  await conectarBaseDeDatos(); // Espera a que Neon esté listo antes de arrancar el servidor

  // Aquí inicias tu servidor Express
  const app = require("./app").default;
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
})();

// Mantener la conexión activa para evitar que Neon entre en modo "idle"
setInterval(async () => {
  try {
    await sql`SELECT 1`;
    console.log("🔄 Manteniendo la conexión activa con Neon...");
  } catch (error) {
    console.error("⚠️ Error al mantener la conexión activa:", error);
  }
}, 600000); // Cada 10 minutos
