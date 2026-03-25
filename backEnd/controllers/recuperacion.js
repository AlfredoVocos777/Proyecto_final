import connection from "../configDB/dataBase.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const SECRET_KEY = 'mi_clave_secreta';

// Solicitar recuperación
export const solicitarRecuperacion = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ mensaje: 'Email requerido' });
  connection.query('SELECT * FROM usuario WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ mensaje: 'Error de base de datos' });
    if (results.length === 0) return res.status(404).json({ mensaje: 'Email no registrado' });
    const user = results[0];
    const token = jwt.sign({ id_usuario: user.id_usuario }, SECRET_KEY, { expiresIn: '15m' });
    // Configurar transporte de correo
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'juanmanuelgonz@gmail.com',
        pass: 'aedn bkio pgnl tkql'
      }
    });
    const resetUrl = `http://localhost:5174/reset-password/${token}`;
    await transporter.sendMail({
      from: 'juanmanuelgonz@gmail.com',
      to: email,
      subject: 'Recuperación de contraseña SIGEDEX',
      html: `<p>Haz clic <a href="${resetUrl}">aquí</a> para restablecer tu contraseña.</p>`
    });
    res.json({ mensaje: 'Correo de recuperación enviado' });
  });
};

// Restablecer contraseña
export const resetPassword = async (req, res) => {
  const { token, nuevaContrasena } = req.body;
  if (!token || !nuevaContrasena) return res.status(400).json({ mensaje: 'Datos requeridos' });
  try {
    const payload = jwt.verify(token, SECRET_KEY);
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(nuevaContrasena, salt);
    connection.query('UPDATE usuario SET contraseña = ? WHERE id_usuario = ?', [hash, payload.id_usuario], (err, result) => {
      if (err) return res.status(500).json({ mensaje: 'Error al actualizar contraseña' });
      if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      res.json({ mensaje: 'Contraseña actualizada correctamente' });
    });
  } catch (err) {
    res.status(400).json({ mensaje: 'Token inválido o expirado' });
  }
};
