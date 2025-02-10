import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está definido en las variables de entorno.");
}

const sql = neon(process.env.DATABASE_URL);

const configurarZonaHoraria = async (intentos = 5) => {
  while (intentos > 0) {
    try {
      await sql`SET TIME ZONE 'America/La_Paz'`; // UTC-4
      console.log("✅ Zona horaria configurada en PostgreSQL a UTC-4");
      return;
    } catch (error) {
      console.error(
        `❌ Intento ${6 - intentos} fallido al configurar la zona horaria:`,
        error
      );
      intentos--;
      if (intentos === 0) {
        console.error(
          "🚨 No se pudo configurar la zona horaria después de varios intentos."
        );
        throw error;
      }
      await new Promise((res) => setTimeout(res, 5000)); // Espera 5 segundos antes de reintentar
    }
  }
};

// Llamar a la función para configurar la zona horaria
configurarZonaHoraria();

export default sql;
