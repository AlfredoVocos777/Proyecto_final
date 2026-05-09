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
                    title: title ? `Tramite: ${title}` : "Tramite SIGEDEX",
                    quantity: Number(quantity) || 1,
                    // Aseguramos un mínimo de $5.00 y por defecto $100.00 para pruebas
                    unit_price: Math.max(Number(price) || 100.0, 5.0),
                    currency_id: "ARS",
                },
            ],
            back_urls: {
                success: "http://localhost:5173/pago-exitoso",
                failure: "http://localhost:5173/pago-fallido",
                pending: "http://localhost:5173/pago-pendiente",
            }
            // auto_return: "approved" fue eliminado para evitar errores en localhost
        };

        const preference = new Preference(client);
        const result = await preference.create({ body });
        
        console.log("Preferencia Sandbox creada:", result.id);

        res.json({
            id: result.id,
            init_point: result.sandbox_init_point || result.init_point
        });
        
    } catch (error) {
        console.error("Error crítico al crear la preferencia de Mercado Pago:");
        if (error.response) {
            console.error("Detalles de la respuesta de MP:", JSON.stringify(error.response, null, 2));
        } else {
            console.error("Mensaje de error:", error.message);
        }

        res.status(500).json({ 
            error: "Error al crear la preferencia de pago",
            details: error.message 
        });
    }
};
