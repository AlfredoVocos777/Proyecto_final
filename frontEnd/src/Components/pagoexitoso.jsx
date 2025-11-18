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

        // Procesar pago exitoso (sin Mercado Pago), creando y registrando si hizo deep-link
        console.log('Procesando pago como exitoso (creación on-load)...');

        // Obtener datos del expediente pendiente
        const expedientePendiente = localStorage.getItem('expedientePendiente');
        console.log('Expediente pendiente en localStorage:', expedientePendiente);
        
        if (!expedientePendiente) {
          console.error('No se encontró expedientePendiente en localStorage');
          setError('No se encontraron datos del expediente. Por favor, inicie el trámite nuevamente.');
          setLoading(false);
          return;
        }

        const datosExpediente = JSON.parse(expedientePendiente);

        // 1. CREAR EL EXPEDIENTE EN LA BASE DE DATOS
        console.log('Creando expediente después del pago exitoso:', datosExpediente);
        
        const responseExpediente = await axios.post(URL_EXPEDIENTES, datosExpediente);
        console.log('Expediente creado:', responseExpediente.data);
        
        const expedienteCreado = {
          ...datosExpediente,
          id: responseExpediente.data.id_expediente,
          numero_expediente: responseExpediente.data.numero_expediente
        };

        // 2. REGISTRAR EL PAGO EN LA BASE DE DATOS
        const pagoData = {
          id_expediente: expedienteCreado.id,
          id_usuario: datosExpediente.id_usuario_presentante,
          monto: 5000,
          metodo_pago: 'otros',
          estado_pago: 'confirmado',
          fecha_pago: new Date().toISOString(),
          referencia_pasarela: `SIMULADO-${Date.now()}`
        };

        console.log('Registrando pago:', pagoData);
        
        const responsePago = await axios.post('http://localhost:8000/api/pagos', pagoData);
        console.log('Pago registrado:', responsePago.data);

        // 3. LIMPIAR LOCALSTORAGE
        localStorage.removeItem('expedienteCreado');
        localStorage.removeItem('expedientePendiente');
        localStorage.removeItem('archivosSeleccionados');
        localStorage.removeItem('preference_id');

        // 4. GUARDAR NÚMERO DE EXPEDIENTE PARA MOSTRAR
        setNumeroExpediente(expedienteCreado.numero_expediente);
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
