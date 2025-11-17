import express from "express";
import { crearAsignacion, obtenerHistorialExpediente } from "../controllers/historial.js";

const router = express.Router();

router.post("/", crearAsignacion);
router.get("/:id_expediente", obtenerHistorialExpediente);

export default router;
