
import connection from "../configDB/dataBase.js";

import express from 'express';
import {
    subirDocumento,
    subirMultiplesDocumentos,
    obtenerDocumentosExpediente,
    eliminarDocumento,
    upload
} from '../controllers/documentos.js';

const router = express.Router();

// Ruta para subir un documento
router.post('/', upload.single('archivo'), subirDocumento);

// Ruta para subir múltiples documentos
router.post('/upload', upload.array('files'), subirMultiplesDocumentos);

// Ruta para obtener documentos de un expediente
router.get('/expediente/:id_expediente', obtenerDocumentosExpediente);

// Ruta para eliminar un documento
router.delete('/:id_documento', eliminarDocumento);

// Ruta para subir y registrar directamente en BD
router.post('/subirYRegistrar', upload.array('files'), async (req, res) => {
    const { id_expediente, subido_por } = req.body;
    const files = req.files || [];

    if (!id_expediente) return res.status(400).json({ error: 'Falta el id_expediente' });
    if (!files.length) return res.status(400).json({ error: 'No se subieron archivos' });

    try {
        const resultados = [];

        for (const file of files) {
            const documento = {
                id_expediente,
                nombre_archivo: file.originalname,
                tipo: file.mimetype,
                ruta_archivo: file.path,
                fecha_subida: new Date(),
                subido_por,
                tamaño_archivo: file.size,
                hash_integridad: null
            };

            const result = await new Promise((resolve, reject) => {
                const sql = 'INSERT INTO Documentos SET ?';
                connection.query(sql, documento, (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });

            resultados.push({ id_documento: result.insertId, nombre: documento.nombre_archivo });
        }

        res.status(201).json({ resultados });
    } catch (error) {
        console.error("Error al subir y registrar documentos:", error);
        res.status(500).json({ error: "Error al registrar los documentos en BD" });
    }
});


export default router;