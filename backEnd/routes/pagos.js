import express from "express";
import { formalizarTramiteYPago } from "../controllers/pagoExpediente.js";

const router = express.Router();

// Ruta donde el frontend enviará TODOS los datos consolidados
router.post("/", formalizarTramiteYPago); 

export default router;