import { MercadoPagoConfig, Preference } from 'mercadopago';
import { MP_ACCESS_TOKEN } from './configDB/mercadoPago.js';

const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
const preference = new Preference(client);

async function run() {
  try {
    const body = {
      items: [{
        title: 'Prueba',
        quantity: 1,
        unit_price: 1,
        currency_id: 'ARS'
      }],
      back_urls: {
        success: 'https://localhost:5173/pago-exitoso',
        failure: 'https://localhost:5173/pago-fallido',
        pending: 'https://localhost:5173/pago-pendiente'
      }
    };
    const result = await preference.create({ body });
    console.log("SUCCESS:", result.id, result.init_point);
  } catch (err) {
    console.log("ERROR ==>");
    console.dir(err, { depth: null });
  }
}
run();
