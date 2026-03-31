import express from "express";
import { notificarPase } from "../controllers/notificacion.js";

const router = express.Router();

// POST /api/notificar-pase
router.post("/notificar-pase", notificarPase);

export default router;
