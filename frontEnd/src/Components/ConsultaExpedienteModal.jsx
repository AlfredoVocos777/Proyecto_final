import { useState } from "react";
import axios from "axios";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { URL_EXPEDIENTES, URL_HISTORIAL } from "../Constants/endpoints";

export default function ConsultaExpedienteModal({ show, onHide }) {
  const [numeroExpedienteConsulta, setNumeroExpedienteConsulta] = useState("");
  const [expedienteConsultado, setExpedienteConsultado] = useState(null);
  const [historialExpediente, setHistorialExpediente] = useState([]);
  const [loadingConsulta, setLoadingConsulta] = useState(false);
  const [mensajeConsulta, setMensajeConsulta] = useState({ tipo: "", texto: "" });

  const cerrarModal = () => {
    setNumeroExpedienteConsulta("");
    setExpedienteConsultado(null);
    setHistorialExpediente([]);
    setMensajeConsulta({ tipo: "", texto: "" });
    onHide();
  };

  /*
    BLOQUE: BÚSQUEDA MANUAL DE EXPEDIENTE
    Esta función se activa cuando el usuario escribe un número de expediente y le da a 'Buscar'.
    Verifica que el campo no esté vacío y lanza un Fetch (GET) localizando el expediente y, a su vez, 
    dispara otra petición para traer su "Historial".
  */
  const buscarExpediente = async () => {
    if (!numeroExpedienteConsulta.trim()) {
      setMensajeConsulta({ tipo: "warning", texto: "Ingrese un número de expediente" });
      return;
    }

    try {
      setLoadingConsulta(true);
      setMensajeConsulta({ tipo: "", texto: "" });

      // Buscar expediente por número
      const responseExpedientes = await axios.get(URL_EXPEDIENTES);
      const expediente = responseExpedientes.data.find(
        exp => exp.numero_expediente === numeroExpedienteConsulta.trim()
      );

      if (!expediente) {
        setMensajeConsulta({ tipo: "danger", texto: "Expediente no encontrado" });
        setExpedienteConsultado(null);
        setHistorialExpediente([]);
        return;
      }

      setExpedienteConsultado(expediente);

      // Obtener historial del expediente
      const responseHistorial = await axios.get(`${URL_HISTORIAL}/${expediente.id_expediente}`);
      setHistorialExpediente(responseHistorial.data || []);

      setMensajeConsulta({ tipo: "success", texto: "Expediente encontrado" });

    } catch (error) {
      console.error("Error al buscar expediente:", error);
      setMensajeConsulta({
        tipo: "danger",
        texto: error.response?.data?.error || "Error al buscar el expediente"
      });
      setExpedienteConsultado(null);
      setHistorialExpediente([]);
    } finally {
      setLoadingConsulta(false);
    }
  };

  return (
    <Modal show={show} onHide={cerrarModal} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Consultar Expediente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {mensajeConsulta.tipo && mensajeConsulta.texto && (
          <Alert variant={mensajeConsulta.tipo}>
            {mensajeConsulta.texto}
          </Alert>
        )}

        {/* Buscador */}
        <Form.Group className="mb-4">
          <Form.Label><strong>Número de Expediente</strong></Form.Label>
          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="Ej: 2025/0001"
              value={numeroExpedienteConsulta}
              onChange={(e) => setNumeroExpedienteConsulta(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && buscarExpediente()}
              disabled={loadingConsulta}
            />
            <Button 
              variant="primary" 
              onClick={buscarExpediente}
              disabled={loadingConsulta}
            >
              {loadingConsulta ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </Form.Group>

        {/* Datos del Expediente */}
        {expedienteConsultado && (
          <>
            <div className="expediente-detalle mb-4">
              <h5 className="mb-3">📋 Datos del Expediente</h5>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <strong>Número:</strong> {expedienteConsultado.numero_expediente}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Tipo:</strong> {expedienteConsultado.tipo_expediente || "N/A"}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Estado:</strong> <span className={`badge badge-${expedienteConsultado.estado_actual}`}>
                    {expedienteConsultado.estado_actual}
                  </span>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Prioridad:</strong> <span className={`badge badge-${expedienteConsultado.prioridad}`}>
                    {expedienteConsultado.prioridad}
                  </span>
                </div>
                <div className="col-12 mb-2">
                  <strong>Descripción:</strong> {expedienteConsultado.descripcion || "Sin descripción"}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Fecha Creación:</strong> {new Date(expedienteConsultado.fecha_creacion).toLocaleString()}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Ubicación:</strong> {expedienteConsultado.ubicacion || "Sin especificar"}
                </div>
                {expedienteConsultado.usuario_nombre && (
                  <div className="col-12 mb-2">
                    <strong>Creado por:</strong> {expedienteConsultado.usuario_nombre} {expedienteConsultado.usuario_apellido}
                  </div>
                )}
              </div>
            </div>

            {/* Historial de Acciones */}
            <div className="historial-expediente">
              <h5 className="mb-3">📜 Historial de Acciones</h5>
              {historialExpediente.length === 0 ? (
                <p className="text-muted">No hay registros de acciones para este expediente.</p>
              ) : (
                <div className="tabla-historial-container">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Fecha</th>
                        <th>Acción</th>
                        <th>Usuario</th>
                        <th>Tipo</th>
                        <th>Comentario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historialExpediente.map((hist, index) => (
                        <tr key={index}>
                          <td>{new Date(hist.fecha).toLocaleString()}</td>
                          <td>{hist.accion}</td>
                          <td>{hist.usuario_nombre} {hist.usuario_apellido}</td>
                          <td>
                            <span className={`badge bg-${hist.tipo_accion === 'asignación' ? 'primary' : hist.tipo_accion === 'revisión' ? 'success' : 'secondary'}`}>
                              {hist.tipo_accion}
                            </span>
                          </td>
                          <td>{hist.comentario || "Sin comentario"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={cerrarModal}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
