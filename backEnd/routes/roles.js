import express from "express";
import { listarRoles, obtenerRolPorId, crearRol, actualizarRol, eliminarRol } from "../controllers/roles.js";

const router = express.Router();

router.get("/", listarRoles);
router.get("/:id", obtenerRolPorId);
router.post("/", crearRol);
router.put("/:id", actualizarRol);
router.delete("/:id", eliminarRol);

export default router;
