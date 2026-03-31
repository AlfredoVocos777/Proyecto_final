import express from "express";
import { crearAsignacion, obtenerHistorialExpediente, recepcionarExpediente, deshacerPase } from "../controllers/historial.js";

const router = express.Router();

router.post("/", crearAsignacion);
router.post("/recepcionar", recepcionarExpediente);
router.delete("/deshacer-pase/:id_expediente", deshacerPase);
router.get("/:id_expediente", obtenerHistorialExpediente);

export default router;
