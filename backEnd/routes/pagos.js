import express from "express";
import { formalizarTramiteYPago } from "../controllers/pagoExpediente.js";
import { crearPreferencia } from "../controllers/mercadopagoController.js";

const router = express.Router();

// Ruta donde el frontend enviará TODOS los datos consolidados
router.post("/", formalizarTramiteYPago); 

// Ruta para inicializar el pago en Mercado Pago
router.post("/crear-preferencia", crearPreferencia);

export default router;