import express from "express";
import { listarFirmas, obtenerFirmaPorId, crearFirma, actualizarFirma, eliminarFirma } from "../controllers/firmas.js";

const router = express.Router();

router.get("/", listarFirmas);
router.get("/:id", obtenerFirmaPorId);
router.post("/", crearFirma);
router.put("/:id", actualizarFirma);
router.delete("/:id", eliminarFirma);

export default router;
