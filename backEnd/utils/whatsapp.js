import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

const { Client, LocalAuth } = pkg; // Extraemos LocalAuth para mayor claridad

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    handleSIGINT: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
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

client.initialize();

export const enviarWhatsapp = async (numero, mensaje) => {
  try {
    if (!isReady) {
      console.log("⏳ WhatsApp aún no está listo...");
      return false;
    }

    // 1. Limpiar el número de todo lo que no sea dígito
    let numeroLimpio = numero.toString().replace(/\D/g, '');

    // 2. Lógica para Argentina (Código 54 + Prefijo 9 + Área + Número)
    // Si el número ya viene con 54, nos aseguramos que tenga el 9.
    // Si viene solo como 381..., le agregamos 549.
    
    let finalId = numeroLimpio;

    if (numeroLimpio.startsWith('54')) {
        if (!numeroLimpio.startsWith('549')) {
            // Transformar 54381... a 549381...
            finalId = '549' + numeroLimpio.substring(2);
        }
    } else {
        // Asumimos que viene como 381... y agregamos 549
        finalId = '549' + numeroLimpio;
    }

    // 3. Quitar el '15' si el usuario lo ingresó (ej: 549381156...)
    if (finalId.startsWith('54938115')) {
        finalId = finalId.replace('15', '');
    }

    const chatId = `${finalId}@c.us`;

    console.log(`🚀 Intentando enviar a: ${chatId}`);
    
    await client.sendMessage(chatId, mensaje);

    console.log("✨ Mensaje enviado con éxito a:", finalId);
    return true;

  } catch (error) {
    console.error("❌ Error enviando WhatsApp:", error);
    return false;
  }
};

export const isWhatsappReady = () => isReady;