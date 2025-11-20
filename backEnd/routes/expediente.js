import express from "express";
import {
  obtenerExpediente,
  crearExpediente,
  obtenerExpedientePorId,
  actualizarExpediente,
  archivarExpediente,
  obtenerPasesPorUsuario,
  obtenerExpedientesFinalizados
} from "../controllers/expediente.js";

const router = express.Router();


router.get("/finalizados", obtenerExpedientesFinalizados);
router.get("/", obtenerExpediente);
router.get("/:id", obtenerExpedientePorId);
router.get("/pases/usuario/:id_usuario", obtenerPasesPorUsuario);
router.post("/", crearExpediente);
router.put("/:id", actualizarExpediente);
router.put("/:id/archivar", archivarExpediente);

export default router;
