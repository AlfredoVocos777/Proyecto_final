export const initMercadoPagoCheckout = (preferenceId) => {
  return new Promise((resolve, reject) => {
    if (!window.mp) {
      reject(new Error('El SDK de Mercado Pago no está inicializado'));
      return;
    }

    try {
      window.mp.checkout.open({
        preference: {
          id: preferenceId
        }
      });
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

// Datos de prueba para desarrollo - Tarjetas de prueba de Mercado Pago Argentina
export const TEST_DATA = {
  // Tarjetas que simulan diferentes respuestas:
  approved: {
    number: '5031 7557 3453 0604', // Mastercard - Pago aprobado
    expiration: '11/25',
    cvc: '123',
    cardholder: {
      name: 'APRO'
    }
  },
  approvedVisa: {
    number: '4509 9535 6623 3704', // Visa - Pago aprobado
    expiration: '11/25',
    cvc: '123',
    cardholder: {
      name: 'APRO'
    }
  },
  pending: {
    number: '5031 4332 1540 6351', // Mastercard - Pago pendiente
    expiration: '11/25',
    cvc: '123',
    cardholder: {
      name: 'CONT'
    }
  },
  rejected: {
    number: '5031 7557 3453 0604', // Mastercard - Pago rechazado (usar nombre OTRE)
    expiration: '11/25',
    cvc: '123',
    cardholder: {
      name: 'OTRE'
    }
  }
};