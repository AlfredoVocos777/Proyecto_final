import express from "express";
import { crearObservacion, obtenerObservaciones } from "../controllers/observacion.js";

const router = express.Router();

// Crear observación
router.post("/", crearObservacion);

// Obtener observaciones por expediente
router.get("/:id_expediente", obtenerObservaciones);

export default router;
