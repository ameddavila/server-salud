import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está definido en las variables de entorno.");
}

const sql = neon(process.env.DATABASE_URL);

// Configurar la zona horaria al conectar a NeonDB
(async () => {
  try {
    await sql`SET TIME ZONE 'America/La_Paz'`; // UTC-4
    console.log("✅ Zona horaria configurada en PostgreSQL a UTC-4");
  } catch (error) {
    console.error(
      "❌ Error al configurar la zona horaria en PostgreSQL:",
      error
    );
  }
})();

export default sql;
