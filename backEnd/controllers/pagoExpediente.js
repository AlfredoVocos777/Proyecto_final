import connection from "../configDB/dataBase.js";
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { MP_ACCESS_TOKEN } from '../configDB/mercadoPago.js';

const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });

// Función centralizada para formalizar Expediente, Documentos y Pago
export const formalizarTramiteYPago = async (req, res) => {
    // 1. Datos recibidos del Frontend
    const {
        expediente: datosExpediente, // Datos del formulario (tipo_expediente, descripcion, etc.)
        pago: datosPago,             // Datos del pago (monto, metodo_pago, referencia_pasarela)
        archivos: archivosTemporales  // IDs o rutas temporales de los archivos subidos
    } = req.body;

    console.log("Datos de archivos recibidos:", archivosTemporales);
    
    // Validación mínima del usuario
    const id_usuario = datosExpediente.id_usuario;
    if (!id_usuario) {
        return res.status(400).json({ error: "Falta el ID del usuario" });
    }

    // --- 1.5 VERIFICACIÓN REAL DEL PAGO EN MERCADO PAGO ---
    // Si el método es mercadopago, verificamos que la referencia sea válida
    if (datosPago.metodo_pago === "mercadopago") {
        try {
            // Extraer el ID numérico (ej: "MP-12345" -> "12345") o (ej: "MP-#12345" -> "12345")
            const paymentId = datosPago.referencia_pasarela.replace("MP-", "").replace("#", "").trim();
            
            if (!paymentId || isNaN(paymentId)) {
                return res.status(400).json({ error: "Número de operación de Mercado Pago inválido." });
            }

            console.log("Verificando pago en Mercado Pago:", paymentId);
            const payment = new Payment(client);
            const paymentData = await payment.get({ id: paymentId });

            if (paymentData.status !== "approved") {
                return res.status(400).json({ 
                    error: `El pago no está aprobado. Estado actual: ${paymentData.status}`,
                    details: "Asegúrese de completar el pago antes de confirmar."
                });
            }
            
            console.log("✅ Pago verificado exitosamente en MP");
        } catch (error) {
            console.error("❌ Error al verificar pago en MP:", error.message);
            return res.status(400).json({ 
                error: "No se pudo validar el número de operación con Mercado Pago.",
                details: "Verifique que el número ingresado sea correcto o que el pago se haya procesado."
            });
        }
    }

    // Usamos una conexión del pool para manejar la transacción de forma segura
    connection.getConnection((err, conn) => {
        if (err) {
            console.error("Error obteniendo conexión del pool:", err);
            return res.status(500).json({ error: "Error de conexión a la base de datos." });
        }

        conn.beginTransaction(async (err) => {
            if (err) {
                conn.release();
                return res.status(500).json({ error: "Error iniciando la transacción." });
            }

            try {
                // --- 2. CREACIÓN Y GENERACIÓN DEL EXPEDIENTE ---
                const year = new Date().getFullYear();
                const sqlUltimo = `SELECT numero_expediente FROM expedientes WHERE numero_expediente LIKE '${year}/%' ORDER BY id_expediente DESC LIMIT 1`;
                const resultsUltimo = await new Promise((resolve, reject) => {
                    conn.query(sqlUltimo, (err, results) => err ? reject(err) : resolve(results));
                });

                let nuevoNumero = 1;
                if (resultsUltimo.length > 0) {
                    const ultimoNumero = resultsUltimo[0].numero_expediente.split("/")[1];
                    nuevoNumero = parseInt(ultimoNumero) + 1;
                }

                const numeroFormateado = nuevoNumero.toString().padStart(4, "0");
                const numero_expediente = `${year}/${numeroFormateado}`;
                const fecha_creacion = new Date();

                const expedienteParaInsertar = {
                    numero_expediente,
                    fecha_creacion,
                    estado_actual: 'en revisión',
                    id_usuario_presentante: id_usuario,
                    tipo_expediente: datosExpediente.tipo_expediente,
                    descripcion: datosExpediente.descripcion,
                    prioridad: datosExpediente.prioridad || 'media',
                    ubicacion: datosExpediente.ubicacion,
                    created_at: fecha_creacion,
                    updated_at: fecha_creacion,
                    confirmar_pago: 'pago confirmado'
                };

                const sqlInsertExp = `INSERT INTO Expedientes SET ?`;
                const resultExp = await new Promise((resolve, reject) => {
                    conn.query(sqlInsertExp, expedienteParaInsertar, (err, result) => err ? reject(err) : resolve(result));
                });

                const idExpediente = resultExp.insertId;

                // --- 3. REGISTRO DEL PAGO ---
                const pagoParaInsertar = {
                    id_expediente: idExpediente,
                    id_usuario: id_usuario,
                    monto: datosPago.monto,
                    metodo_pago: datosPago.metodo_pago,
                    estado_pago: 'confirmado',
                    fecha_pago: fecha_creacion,
                    referencia_pasarela: datosPago.referencia_pasarela
                };

                const sqlInsertPago = `INSERT INTO pagos SET ?`;
                await new Promise((resolve, reject) => {
                    conn.query(sqlInsertPago, pagoParaInsertar, (err, result) => err ? reject(err) : resolve(result));
                });

                // --- 4. VINCULACIÓN DE DOCUMENTOS ---
                if (archivosTemporales && archivosTemporales.length > 0) {
                    for (const arch of archivosTemporales) {
                        const documentoParaInsertar = {
                            id_expediente: idExpediente,
                            nombre_archivo: arch.nombre_archivo,
                            tipo: arch.tipo,
                            ruta_archivo: arch.ruta_archivo,
                            fecha_subida: fecha_creacion,
                            subido_por: id_usuario,
                            tamaño_archivo: arch.tamaño_archivo || 0,
                            categoria: arch.categoria || null,
                            hash_integridad: arch.hash_integridad || null 
                        };

                        const sqlInsertDoc = `INSERT INTO documentos SET ?`;
                        await new Promise((resolve, reject) => {
                            conn.query(sqlInsertDoc, documentoParaInsertar, (err, result) => {
                                if (err) {
                                    console.error("❌ ERROR al insertar documento:", err);
                                    return reject(err);
                                }
                                resolve(result);
                            });
                        });
                    }
                }

                // --- 5. FIN DE LA TRANSACCIÓN ---
                conn.commit((err) => {
                    if (err) {
                        conn.rollback(() => {
                            conn.release();
                            console.error("Rollback ejecutado");
                        });
                        return res.status(500).json({ error: "Error al confirmar la transacción." });
                    }

                    conn.release();
                    res.status(201).json({
                        mensaje: "Trámite y Pago formalizados exitosamente",
                        id_expediente: idExpediente,
                        numero_expediente,
                        fecha_creacion,
                        expediente: expedienteParaInsertar
                    });
                });

            } catch (error) {
                conn.rollback(() => {
                    conn.release();
                    console.error("❌ Error en la transacción de pago y expediente:", error);
                    res.status(500).json({ error: "Error al formalizar el trámite. Transacción revertida." });
                });
            }
        });
    });
};