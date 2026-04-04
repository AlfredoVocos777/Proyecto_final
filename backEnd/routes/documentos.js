
import connection from "../configDB/dataBase.js";

import express from 'express';
import {
    subirDocumento,
    subirMultiplesDocumentos,
    obtenerDocumentosExpediente,
    eliminarDocumento,
    upload,
    uploadInterno,
    verDocumento,
    subirYRegistrar
} from '../controllers/documentos.js';

const router = express.Router();

// Ruta para subir un documento
router.post('/', (req, res, next) => {
    uploadInterno.single('archivo')(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        next();
    });
}, subirDocumento);

// Ruta para subir múltiples documentos
router.post('/upload', upload.array('files'), subirMultiplesDocumentos);

// Ruta para obtener documentos de un expediente
router.get('/expediente/:id_expediente', obtenerDocumentosExpediente);

// Ruta para eliminar un documento
router.delete('/:id_documento', eliminarDocumento);

// Ruta para subir y registrar directamente en BD desde el modal ver del presentante
router.post('/subirYRegistrar', (req, res, next) => {
    uploadInterno.array('files')(req, res, (err) => {
        if (err) {
            console.error('Error multer subirYRegistrar:', err.message);
            return res.status(400).json({ error: err.message || 'Error al procesar el archivo' });
        }
        next();
    });
}, subirYRegistrar);
    
// Ruta para ver/descargar un documento desde el modal ver del presentante
router.get("/ver/:id_documento", verDocumento);

export default router;