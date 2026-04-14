import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { URL_EXPEDIENTES } from '../Constants/endpoints';
import { Container, Alert, Spinner } from 'react-bootstrap';

const PagoExitoso = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numeroExpediente, setNumeroExpediente] = useState(null);

  useEffect(() => {
    const procesarPagoExitoso = async () => {
      try {
        console.log('=== INICIO PROCESAMIENTO PAGO EXITOSO ===');
        
        // Si venimos con estado desde navigate (ya creado y pagado), solo mostramos
        const expedienteState = location.state?.expediente;
        if (expedienteState?.numero_expediente) {
          console.log('Expediente recibido por estado de navegación:', expedienteState);
          // Limpiar posibles residuos de flujo anterior
          localStorage.removeItem('expedienteCreado');
          localStorage.removeItem('expedientePendiente');
          localStorage.removeItem('archivosSeleccionados');
          localStorage.removeItem('preference_id');

          setNumeroExpediente(expedienteState.numero_expediente);
          setLoading(false);
          return;
        }

        // El pago ya se formalizó en Nuevo_tramitePago.jsx
        // Si llegamos sin expedienteCreado, es un error de flujo.
        const expedienteCreado = localStorage.getItem("expedienteCreado");
        if (!expedienteCreado) {
          console.error('No se encontró expediente creado en localStorage');
          setError('No se pudo verificar el expediente. Por favor, consulte en Mis Trámites.');
          setLoading(false);
          return;
        }

        const expedienteFormalizado = JSON.parse(expedienteCreado);
        setNumeroExpediente(expedienteFormalizado.numero_expediente);
        setLoading(false);

      } catch (error) {
        console.error('Error al procesar el pago exitoso:', error);
        setError('Error al procesar el pago: ' + (error.response?.data?.error || error.message));
        setLoading(false);
      }
    };

    procesarPagoExitoso();
  }, [searchParams, navigate, location.state]);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" variant="primary" />
        <p className="mt-3">Procesando su pago...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/Portada')}>
            Volver a la portada
          </button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Alert variant="primary">
        <Alert.Heading>¡Pago Exitoso!</Alert.Heading>
        <p>Su trámite ha sido procesado correctamente.</p>
        {numeroExpediente && (
          <p><strong>Número de expediente: {numeroExpediente}</strong></p>
        )}
        <button className="btn btn-primary" onClick={() => navigate('/Portada')}>
          Volver a la portada
        </button>
      </Alert>
    </Container>
  );
};

export default PagoExitoso;
