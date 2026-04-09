import express from "express";
import { notificarPase, notificarDecision } from "../controllers/notificacion.js";

const router = express.Router();

// POST /api/notificar-pase
router.post("/notificar-pase", notificarPase);

// POST /api/notificar-decision  (Director aprueba o rechaza)
router.post("/notificar-decision", notificarDecision);

export default router;
