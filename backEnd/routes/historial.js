import express from "express";
import { crearAsignacion, obtenerHistorialExpediente, recepcionarExpediente } from "../controllers/historial.js";

const router = express.Router();

router.post("/", crearAsignacion);
router.post("/recepcionar", recepcionarExpediente);
router.get("/:id_expediente", obtenerHistorialExpediente);

export default router;
