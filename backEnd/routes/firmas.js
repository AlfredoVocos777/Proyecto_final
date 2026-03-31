import express from "express";
import { listarFirmas, obtenerFirmaPorId, crearFirma, actualizarFirma, eliminarFirma, iniciarOTP, validarOTP } from "../controllers/firmas.js";

const router = express.Router();

router.get("/", listarFirmas);
router.get("/:id", obtenerFirmaPorId);
router.post("/", crearFirma);
router.put("/:id", actualizarFirma);
router.delete("/:id", eliminarFirma);

// Endpoint para iniciar validación OTP
router.post("/iniciar-otp", iniciarOTP);

// Endpoint para validar OTP
router.post("/validar-otp", validarOTP);

export default router;
