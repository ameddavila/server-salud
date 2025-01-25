import express from "express";
import cors from "cors";
import apiKeyRoutes from "./routes/apiKeyRoutes";
import dataRoutes from "./routes/dataRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();

// Configuración de CORS
app.use(
  cors({
    origin: "http://localhost:3000", // Permitir solicitudes solo desde el cliente-salud
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  })
);

// Middleware para manejar JSON y datos codificados en la URL
app.use(express.json({ limit: "10mb" })); // Cambia '10mb' según el tamaño que necesites
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Rutas
app.use("/api/keys", apiKeyRoutes); // Rutas para manejar API Keys
app.use("/auth", authRoutes); // Rutas para autenticación
app.use("/api", dataRoutes); // Rutas protegidas para datos

export default app;
