import express from "express";
import { listarPermisos, obtenerPermisoPorId, crearPermiso, actualizarPermiso, eliminarPermiso } from "../controllers/permisos.js";

const router = express.Router();

router.get("/", listarPermisos);
router.get("/:id", obtenerPermisoPorId);
router.post("/", crearPermiso);
router.put("/:id", actualizarPermiso);
router.delete("/:id", eliminarPermiso);

export default router;
