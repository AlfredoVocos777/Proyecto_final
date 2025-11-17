import express from "express";

import {
  obtenerExpediente,
  crearExpediente,
 
} from "../controllers/tramite.js";

const router = express.Router();

router.get("/", obtenerExpediente);
router.post("/", crearExpediente);

export default router;
