import cron from "node-cron";
import sql from "../config/database";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

// Configurar el cron job (Ejecuta a la medianoche diariamente)
cron.schedule("0 0 * * *", async () => {
  console.log("Ejecutando renovación automática de API Keys...");

  try {
    // Buscar API Keys que expiren en los próximos 3 días
    const keysToRenew = await sql`
      SELECT * FROM api_keys
      WHERE fecha_expiracion <= NOW() + INTERVAL '3 days'
      AND activo = TRUE
    `;

    for (const key of keysToRenew) {
      // Generar un nuevo API Key
      const newApiKey = uuidv4();
      const newHashedApiKey = crypto
        .createHash("sha256")
        .update(newApiKey)
        .digest("hex");

      const newExpirationDate = new Date();
      newExpirationDate.setDate(newExpirationDate.getDate() + 30); // Nueva fecha de expiración (30 días más)

      // Actualizar el registro existente: marcar inactivo el anterior y crear uno nuevo
      await sql`
        UPDATE api_keys
        SET activo = FALSE
        WHERE id = ${key.id}
      `;

      await sql`
        INSERT INTO api_keys (code_establecimiento, api_key, fecha_expiracion, activo)
        VALUES (${key.code_establecimiento}, ${newHashedApiKey}, ${newExpirationDate}, TRUE)
      `;

      console.log(
        `API Key renovado para codeEstablecimiento: ${key.code_establecimiento}`
      );
    }
  } catch (error) {
    console.error("Error durante la renovación automática de API Keys:", error);
  }
});
