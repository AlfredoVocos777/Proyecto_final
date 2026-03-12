import express from "express";
import connection from "../configDB/dataBase.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Configura tu transporte de email (ajusta usuario y pass)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sigedex01@gmail.com',
    pass: '1412Nacho'
  }
});

function generarOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Solicitar OTP
router.post('/solicitar-otp', async (req, res) => {
  const { id_expediente, id_usuario } = req.body;
  const otp = generarOTP();
  const timestamp_otp = new Date();

  // Busca el email del usuario
  connection.query('SELECT email FROM usuario WHERE id_usuario = ?', [id_usuario], (err, results) => {
    if (err || !results[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
    const email = results[0].email;

    // Guarda el OTP en la tabla firmas_digitales
    connection.query(
      `INSERT INTO firmas_digitales (id_expediente, id_usuario, otp, timestamp_otp, firmado) VALUES (?, ?, ?, ?, 0)
      ON DUPLICATE KEY UPDATE otp=?, timestamp_otp=?, firmado=0`,
      [id_expediente, id_usuario, otp, timestamp_otp, otp, timestamp_otp],
      (err2) => {
        if (err2) return res.status(500).json({ error: 'Error al guardar OTP' });
        // Envía el OTP por email
        transporter.sendMail({
          from: 'sigedex1@gmail.com',
          to: email,
          subject: 'Código de Firma Digital',
          text: `Su código OTP para firmar el expediente es: ${otp}`
        }, (err3) => {
          if (err3) return res.status(500).json({ error: 'Error al enviar email' });
          res.json({ ok: true, mensaje: 'OTP enviado por email' });
        });
      }
    );
  });
});

// Validar OTP
router.post('/validar-otp', (req, res) => {
  const { id_expediente, id_usuario, otp } = req.body;
  connection.query(
    'SELECT * FROM firmas_digitales WHERE id_expediente = ? AND id_usuario = ? AND firmado = 0',
    [id_expediente, id_usuario],
    (err, results) => {
      if (err || !results[0]) return res.status(400).json({ error: 'No se encontró solicitud de firma' });
      const registro = results[0];
      const ahora = new Date();
      const fechaOTP = new Date(registro.timestamp_otp);
      const minutos = (ahora - fechaOTP) / 60000;
      if (registro.otp !== otp) return res.status(400).json({ error: 'OTP incorrecto' });
      if (minutos > 5) return res.status(400).json({ error: 'OTP expirado' });
      // Marca como firmado
      connection.query('UPDATE firmas_digitales SET firmado = 1, fecha_firma = NOW() WHERE id_firma = ?', [registro.id_firma], (err2) => {
        if (err2) return res.status(500).json({ error: 'Error al actualizar firma' });
        res.json({ firmado: true });
      });
    }
  );
});

export default router;
