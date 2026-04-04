import nodemailer from "nodemailer";
import connection from "../configDB/dataBase.js";

// Helper reutilizable: envia mail + registra en BD
const _enviarNotificacion = ({ res, email, asunto, texto, id_usuario, mensaje_db, tipo_db }) => {
  let mailSent = false;
  let mailError = null;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  });

  transporter.sendMail({ from: process.env.MAIL_USER, to: email, subject: asunto, text: texto })
    .then(() => { mailSent = true; })
    .catch(err => { mailError = err.message; console.error("Error enviando mail:", err); })
    .finally(() => {
      connection.query(
        `INSERT INTO notificaciones (id_usuario, mensaje, tipo, fecha_envio, leida, canal, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id_usuario, mensaje_db, tipo_db, new Date(), 0, "email", new Date()],
        (err) => {
          if (err) {
            console.error("Error guardando notificacion en BD:", err);
            return res.status(500).json({ message: "Error guardando notificacion en BD", error: err.message, mailError });
          }
          if (mailSent) {
            res.status(200).json({ message: "Notificacion enviada y registrada" });
          } else {
            res.status(207).json({ message: "Notificacion registrada en BD pero error enviando mail", mailError });
          }
        }
      );
    });
};

export const notificarCreacion = (req, res) => {
  const { email, nombre, apellido, numero_expediente, tipo_expediente, id_usuario } = req.body;
  if (!email || !numero_expediente) {
    return res.status(400).json({ message: "Faltan datos obligatorios: email y numero_expediente" });
  }
  _enviarNotificacion({
    res, email, id_usuario,
    asunto: `Expediente ${numero_expediente} creado exitosamente`,
    texto: `Hola ${nombre} ${apellido},\n\nSu expediente N ${numero_expediente} (${tipo_expediente || "sin tipo"}) fue creado con exito y esta siendo procesado.\n\nAnte cualquier consulta comuniquese con la mesa de entradas.\n\nSaludos.`,
    mensaje_db: `Su expediente N ${numero_expediente} fue creado exitosamente y esta siendo procesado.`,
    tipo_db: "creacion_expediente",
  });
};

export const notificarPase = (req, res) => {
  const { email, nombre, apellido, numero_expediente, observacion, id_usuario } = req.body;
  if (!email || !numero_expediente) {
    return res.status(400).json({ message: "Faltan datos obligatorios: email y numero_expediente" });
  }
  _enviarNotificacion({
    res, email, id_usuario,
    asunto: `Expediente ${numero_expediente} - Nuevo pase realizado`,
    texto: `Hola ${nombre} ${apellido},\n\nSu expediente N ${numero_expediente} ha sido derivado.\nObservacion: ${observacion || "Sin observaciones"}.\n\nSaludos.`,
    mensaje_db: `Su expediente N ${numero_expediente} fue derivado a un tecnico para su revision. Observacion: ${observacion || "Sin observaciones"}`,
    tipo_db: "pase_expediente",
  });
};
