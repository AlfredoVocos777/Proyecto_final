import express from "express";
import {
  obtenerTiposTramite,
  crearTipoTramite,
  actualizarTipoTramite,
  eliminarTipoTramite,
} from "../controllers/tiposTramite.js";

const router = express.Router();

router.get("/", obtenerTiposTramite);
router.post("/", crearTipoTramite);
router.put("/:id", actualizarTipoTramite);
router.delete("/:id", eliminarTipoTramite);

export default router;
