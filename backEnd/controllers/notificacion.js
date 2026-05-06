import nodemailer from "nodemailer";
import connection from "../configDB/dataBase.js";

// Notificar al presentante cuando el Director aprueba o rechaza
export const notificarDecision = async (req, res) => {
  const { email, nombre, apellido, numero_expediente, estado, comentario, id_usuario } = req.body;
  if (!email || !numero_expediente || !estado) {
    return res.status(400).json({ message: "Faltan datos requeridos" });
  }
  const esAprobado = estado === "aprobado";
  const emoji = esAprobado ? "✅" : "❌";
  const accionTexto = esAprobado ? "APROBADO" : "RECHAZADO";

  let mailError = null;
  let mailSent = false;
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: `${emoji} Expediente ${numero_expediente} - ${accionTexto}`,
      html: `
        <h2>SIGEDEX — Dirección Provincial del Agua</h2>
        <p>Hola <strong>${nombre} ${apellido}</strong>,</p>
        <p>Su expediente N° <strong>${numero_expediente}</strong> ha sido <strong>${accionTexto}</strong> ${emoji} por la Dirección.</p>
        ${comentario ? `<p><strong>Observación del Director:</strong> ${comentario}</p>` : ""}
        <hr/>
        <p><small>Este es un aviso automático. Para más información ingrese al sistema SIGEDEX.</small></p>
      `,
    });
    mailSent = true;
  } catch (error) {
    mailError = error.message;
    console.error("Error enviando mail de decisión:", error);
  }

  // Registrar en tabla notificaciones
  try {
    const mensaje = `Su expediente N° ${numero_expediente} fue ${accionTexto} por la Dirección. ${comentario ? "Observación: " + comentario : ""}`;
    connection.query(
      `INSERT INTO notificaciones (id_usuario, mensaje, tipo, fecha_envio, leida, canal, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_usuario, mensaje, "decision_director", new Date(), 0, "email", new Date()],
      (err) => {
        if (err) console.error("Error guardando notificación de decisión:", err);
      }
    );
  } catch (err) {
    console.error("Error registrando notificación:", err);
  }

  if (mailSent) {
    res.status(200).json({ message: "Notificación de decisión enviada" });
  } else {
    res.status(500).json({ message: "Error enviando mail de decisión", mailError });
  }
};

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
