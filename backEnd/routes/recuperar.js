const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Simulación de usuarios
const usuarios = [
  { usuario: 'admin', email: 'admin@correo.com', contrasena: 'admin123' },
  { usuario: 'docente', email: 'docente@correo.com', contrasena: 'docente123' }
];

const SECRET_KEY = 'mi_clave_secreta';

// Endpoint para solicitar recuperación
router.post('/recuperar', async (req, res) => {
  const { email } = req.body;
  const user = usuarios.find(u => u.email === email);
  if (!user) return res.status(404).json({ mensaje: 'Email no registrado' });

  // Generar token temporal para reset
  const token = jwt.sign({ usuario: user.usuario }, SECRET_KEY, { expiresIn: '15m' });

  // Configurar transporte de correo
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tuemail@gmail.com',
      pass: 'tucontraseña'
    }
  });

  const resetUrl = `http://localhost:3001/reset-password/${token}`;
  await transporter.sendMail({
    from: 'tuemail@gmail.com',
    to: email,
    subject: 'Recuperación de contraseña',
    html: `<p>Haz clic <a href="${resetUrl}">aquí</a> para restablecer tu contraseña.</p>`
  });

  res.json({ mensaje: 'Correo de recuperación enviado' });
});

module.exports = router;
