import express from "express";
import {
  obtenerExpediente,
  crearExpediente
} from "../controllers/expediente.js";

const router = express.Router();

router.get("/", obtenerExpediente);
router.post("/", crearExpediente);

export default router;
