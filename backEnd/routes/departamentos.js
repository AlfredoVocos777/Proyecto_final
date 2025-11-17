import express from "express";
import { listarDepartamentos, obtenerDepartamentoPorId, crearDepartamento, actualizarDepartamento, eliminarDepartamento } from "../controllers/departamentos.js";

const router = express.Router();

router.get("/", listarDepartamentos);
router.get("/:id", obtenerDepartamentoPorId);
router.post("/", crearDepartamento);
router.put("/:id", actualizarDepartamento);
router.delete("/:id", eliminarDepartamento);

export default router;
