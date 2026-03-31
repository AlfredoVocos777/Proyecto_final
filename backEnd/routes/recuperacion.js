import express from "express";
import { solicitarRecuperacion, resetPassword } from "../controllers/recuperacion.js";

const router = express.Router();

// POST /api/recuperar
router.post("/recuperar", solicitarRecuperacion);

// POST /api/reset-password
router.post("/reset-password", resetPassword);

export default router;
