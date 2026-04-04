import express from "express";
import { notificarPase, notificarCreacion } from "../controllers/notificacion.js";

const router = express.Router();

// POST /api/notificar-pase
router.post("/notificar-pase", notificarPase);

// POST /api/notificar-creacion
router.post("/notificar-creacion", notificarCreacion);

export default router;
