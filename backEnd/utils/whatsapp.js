import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

const { Client, LocalAuth } = pkg; // Extraemos LocalAuth para mayor claridad

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true, // Cambia a false si quieres ver el navegador (solo local)
    handleSIGINT: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
});

let isReady = false;

client.on("qr", (qr) => {
  console.log("--- NUEVO QR DETECTADO ---");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ WhatsApp conectado correctamente y listo para enviar");
  isReady = true;
});

client.on("authenticated", () => {
  console.log("🔐 Sesión autenticada correctamente");
});

client.on("auth_failure", (msg) => {
  console.error("❌ Fallo en la autenticación:", msg);
});

client.on("disconnected", (reason) => {
  console.log("⚠️ WhatsApp desconectado:", reason);
  isReady = false;
});

// client.initialize(); // Desactivado por solicitud del usuario


export const enviarWhatsapp = async (numero, mensaje) => {
  /* 
  Módulo de WhatsApp desactivado temporalmente por solicitud del usuario.
  Para reactivar: 
  1. Descomentar client.initialize() en este archivo.
  2. Descomentar el import en index.js.
  */
  console.log("ℹ️ Envío de WhatsApp omitido (Módulo desactivado)");
  return false;

};

export const isWhatsappReady = () => isReady;