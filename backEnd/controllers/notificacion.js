import nodemailer from "nodemailer";
import connection from "../configDB/dataBase.js";

export const notificarPase = async (req, res) => {
  const { email, nombre, apellido, numero_expediente, observacion, id_usuario } = req.body;
  let mailError = null;
  let mailSent = false;
  // 1. Intentar enviar el mail
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: `Expediente ${numero_expediente} - Nuevo pase realizado`,
      text: `Hola ${nombre} ${apellido},\n\nSu expediente N° ${numero_expediente} ha sido derivado.\nObservación: ${observacion || "Sin observaciones"}.\n\nSaludos.`,
    };
    await transporter.sendMail(mailOptions);
    mailSent = true;
  } catch (error) {
    mailError = error.message;
    console.error("Error enviando mail:", error);
  }
  // 2. Registrar la notificación en la base de datos (canal: 'email')
  try {
    const mensaje = `Su expediente N° ${numero_expediente} fue derivado a un técnico para su revisión. Observación: ${observacion || "Sin observaciones"}`;
    const tipo = "pase_expediente";
    const canal = "email";
    const fecha_envio = new Date();
    const leida = 0;
    const created_at = new Date();
    connection.query(
      `INSERT INTO notificaciones (id_usuario, mensaje, tipo, fecha_envio, leida, canal, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_usuario, mensaje, tipo, fecha_envio, leida, canal, created_at],
      (err, result) => {
        if (err) {
          console.error("Error guardando notificación en la base de datos:", err);
          return res.status(500).json({ message: "Error guardando notificación en la base de datos", error: err.message, mailError });
        }
        if (mailSent) {
          res.status(200).json({ message: "Notificación enviada por email y registrada en la base de datos" });
        } else {
          res.status(500).json({ message: "Notificación registrada pero error enviando mail", mailError });
        }
      }
    );
  } catch (error) {
    console.error("Error general en notificación:", error);
    res.status(500).json({ message: "Error general en notificación", error: error.message, mailError });
  }
};
