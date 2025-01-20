import express from "express";
import bodyParser from "body-parser";
import dataRoutes from "./routes/dataRoutes";

const app = express();

// Middleware
//app.use(bodyParser.json());

// Middleware para manejar JSON con tamaño más grande
app.use(bodyParser.json({ limit: "10mb" })); // Cambia '10mb' según el tamaño que necesites
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Rutas
app.use("/api", dataRoutes);

export default app;
