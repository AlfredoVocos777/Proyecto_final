import { MercadoPagoConfig, Preference } from 'mercadopago';
import { MP_ACCESS_TOKEN } from '../configDB/mercadoPago.js';

// Inicializamos el cliente de Mercado Pago con el token configurado localmente
const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });


export const crearPreferencia = async (req, res) => {
    try {
        const { title, quantity, price } = req.body;

        const body = {
            items: [
                {
                    title: title || "Trámite - SIGEDEX",
                    quantity: Number(quantity) || 1,
                    unit_price: Number(price) || 0.05,
                    currency_id: "ARS",
                },
            ],
            back_urls: {
                success: "http://localhost:5173/pago-exitoso",
                failure: "http://localhost:5173/pago-fallido",
                pending: "http://localhost:5173/pago-pendiente",
            }
        };

        const preference = new Preference(client);
        const result = await preference.create({ body });
        
        // Respondemos con el ID de la preferencia y el enlace de pago
        res.json({
            id: result.id,
            init_point: result.init_point
        });
        
    } catch (error) {
        console.error("Error al crear la preferencia de Mercado Pago:", error);
        res.status(500).json({ error: "Error al crear la preferencia de pago" });
    }
};
