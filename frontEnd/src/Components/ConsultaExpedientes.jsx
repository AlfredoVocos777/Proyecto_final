import React, { useState, useEffect, useCallback } from "react";
import {
  Table, Container, Badge, Spinner, Alert, Form,
  InputGroup, Button, Modal, ListGroup
} from "react-bootstrap";
import axios from "axios";
import { URL_EXPEDIENTES, URL_USUARIOS } from "../Constants/endpoints";

const API_DOCS      = "http://localhost:8000/api/documentos";
const API_HISTORIAL = "http://localhost:8000/historial";
const API_NOTIFICAR = "http://localhost:8000/api/notificar-pase";

const BADGE_ESTADO = {
  "pendiente":    "warning",
  "en revision":  "info",
  "asignado":     "primary",
  "aprobado":     "success",
  "rechazado":    "danger",
  "archivado":    "secondary",
  "finalizado":   "dark",
};

function getBadge(estado) {
  if (!estado) return "secondary";
  return BADGE_ESTADO[estado.toLowerCase()] ?? "primary";
}

function formatFecha(fecha) {
  if (!fecha) return "-";
  return new Date(fecha).toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

// Modal de Realizar Pase
function ModalPase({ expediente, onClose, onPaseExitoso, onRemoveRow }) {
  const [documentos, setDocumentos]       = useState([]);
  const [tecnicos, setTecnicos]           = useState([]);
  const [loadingDocs, setLoadingDocs]     = useState(true);
  const [tecnicoId, setTecnicoId]         = useState("");
  const [observacion, setObservacion]     = useState("");
  const [enviando, setEnviando]           = useState(false);
  const [feedback, setFeedback]           = useState(null);

  useEffect(() => {
    if (!expediente) return;
    setLoadingDocs(true);
    axios
      .get(`${API_DOCS}/expediente/${expediente.id_expediente}`)
      .then((res) => setDocumentos(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDocumentos([]))
      .finally(() => setLoadingDocs(false));
    axios
      .get(URL_USUARIOS)
      .then((res) => {
        const lista = Array.isArray(res.data) ? res.data : [];
        setTecnicos(lista.filter((u) => (u.tipo_usuario ?? "").toLowerCase() === "tecnico"));
      })
      .catch(() => setTecnicos([]));
  }, [expediente]);

  const handlePase = useCallback(async () => {
    if (!tecnicoId) { setFeedback({ tipo: "warning", msg: "Selecciona un tecnico para realizar el pase." }); return; }
    if (!observacion.trim()) { setFeedback({ tipo: "warning", msg: "Ingresa una observacion del pase." }); return; }
    setEnviando(true);
    setFeedback(null);
    try {
      const tecnico = tecnicos.find((t) => String(t.id_usuario) === String(tecnicoId));
      await axios.post(API_HISTORIAL, {
        id_expediente:          expediente.id_expediente,
        id_usuario_responsable: tecnicoId,
        accion:                 "Pase a tecnico",
        comentario:             observacion,
        tipo_accion:            "asignacion",
      });
      await axios.put(`${URL_EXPEDIENTES}/${expediente.id_expediente}`, {
        id_profesional_asignado: tecnicoId,
        estado_actual: "asignado",
      });
      try {
        await axios.post(API_NOTIFICAR, {
          id_usuario:        expediente.id_usuario_presentante,
          email:             expediente.email_presentante ?? "",
          nombre:            expediente.usuario_presentante_nombre ?? "",
          apellido:          expediente.usuario_presentante_apellido ?? "",
          numero_expediente: expediente.numero_expediente,
          observacion,
          tecnico_nombre:    tecnico ? `${tecnico.nombre} ${tecnico.apellido}` : "",
        });
      } catch (_) {}
      setFeedback({ tipo: "success", msg: `Pase realizado al tecnico ${tecnico?.nombre ?? ""} ${tecnico?.apellido ?? ""}.` });
      setTimeout(() => { onRemoveRow(expediente.id_expediente); onClose(); }, 1800);
    } catch (err) {
      setFeedback({ tipo: "danger", msg: "Error al realizar el pase. Verifica la conexion con el servidor." });
    } finally {
      setEnviando(false);
    }
  }, [tecnicoId, observacion, expediente, tecnicos, onClose, onPaseExitoso]);

  const extIcon = (nombre) => {
    const ext = (nombre ?? "").split(".").pop().toLowerCase();
    if (["pdf"].includes(ext)) return "📄";
    if (["jpg","jpeg","png","gif","webp"].includes(ext)) return "🖼️";
    if (["doc","docx"].includes(ext)) return "📝";
    return "📎";
  };

  if (!expediente) return null;

  return (
    <Modal show onHide={onClose} size="lg" centered backdrop="static">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          Realizar Pase - Expediente N{expediente.numero_expediente}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="rounded p-3 mb-4 border bg-light">
          <div className="row g-2">
            <div className="col-md-6"><strong>Tipo:</strong> {expediente.tipo_expediente ?? "-"}</div>
            <div className="col-md-6">
              <strong>Estado actual:</strong>{" "}
              <Badge bg={getBadge(expediente.estado_actual)}>{expediente.estado_actual ?? "Sin estado"}</Badge>
            </div>
            <div className="col-md-6">
              <strong>Presentante:</strong>{" "}
              {expediente.usuario_presentante_nombre
                ? `${expediente.usuario_presentante_nombre} ${expediente.usuario_presentante_apellido ?? ""}`
                : "-"}
            </div>
            <div className="col-md-6"><strong>Fecha:</strong> {formatFecha(expediente.fecha_creacion)}</div>
          </div>
        </div>
        <h6 className="fw-bold mb-2">Documentos adjuntos</h6>
        {loadingDocs ? (
          <div className="text-center py-3"><Spinner size="sm" /> Cargando documentos</div>
        ) : documentos.length === 0 ? (
          <Alert variant="secondary" className="py-2">Este expediente no tiene documentos adjuntos.</Alert>
        ) : (
          <ListGroup className="mb-4">
            {documentos.map((doc) => (
              <ListGroup.Item key={doc.id_documento} className="d-flex justify-content-between align-items-center">
                <span>{extIcon(doc.nombre_archivo)} {doc.nombre_archivo}</span>
                <Button size="sm" variant="outline-primary"
                  href={`${API_DOCS}/ver/${doc.id_documento}`} target="_blank" rel="noopener noreferrer">
                  Ver / Descargar
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
        <hr />
        <h6 className="fw-bold mb-3">Asignar tecnico y observaciones</h6>
        <Form.Group className="mb-3">
          <Form.Label>Tecnico destino <span className="text-danger">*</span></Form.Label>
          <Form.Select value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)}>
            <option value="">- Selecciona un tecnico -</option>
            {tecnicos.map((t) => (
              <option key={t.id_usuario} value={t.id_usuario}>{t.nombre} {t.apellido}</option>
            ))}
          </Form.Select>
          {tecnicos.length === 0 && (
            <Form.Text className="text-muted">No se encontraron tecnicos disponibles.</Form.Text>
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Observaciones del pase <span className="text-danger">*</span></Form.Label>
          <Form.Control as="textarea" rows={3} value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder="Describe el motivo del pase o indicaciones para el tecnico" />
        </Form.Group>
        {feedback && (
          <Alert variant={feedback.tipo} className="py-2 mb-0">{feedback.msg}</Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={enviando}>Cancelar</Button>
        <Button variant="primary" onClick={handlePase} disabled={enviando || !tecnicoId || !observacion.trim()}>
          {enviando ? <><Spinner size="sm" className="me-2" />Procesando</> : "Confirmar Pase"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// Componente principal
export default function ConsultaExpedientes({ filtroEstado, ocultarAsignado = false }) {
  const [expedientes, setExpedientes]         = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [busqueda, setBusqueda]               = useState("");
  const [expedienteModal, setExpedienteModal] = useState(null);

  const cargarExpedientes = useCallback(() => {
    setLoading(true);
    const params = filtroEstado ? { estado: filtroEstado } : {};
    axios
      .get(URL_EXPEDIENTES, { params })
      .then((res) => {
        setExpedientes(Array.isArray(res.data) ? res.data : []);
        setError(null);
      })
      .catch(() => setError("No se pudieron cargar los expedientes. Verifica que el servidor este activo."))
      .finally(() => setLoading(false));
  }, [filtroEstado]);

  const handleRemoveRow = useCallback((id) => {
    setExpedientes((prev) => prev.filter((e) => e.id_expediente !== id));
  }, []);

  useEffect(() => { cargarExpedientes(); }, [cargarExpedientes]);

  const datos = expedientes.filter((exp) => {
    const coincideEstado = filtroEstado
      ? (exp.estado_actual ?? "").toLowerCase() === filtroEstado.toLowerCase()
      : true;
    const texto = busqueda.toLowerCase();
    const coincideBusqueda =
      (exp.numero_expediente ?? "").toLowerCase().includes(texto) ||
      (exp.tipo_expediente ?? "").toLowerCase().includes(texto) ||
      (exp.descripcion ?? "").toLowerCase().includes(texto) ||
      (`${exp.usuario_presentante_nombre ?? ""} ${exp.usuario_presentante_apellido ?? ""}`).toLowerCase().includes(texto);
    return coincideEstado && coincideBusqueda;
  });

  return (
    <Container fluid className="py-3">
      <div className="d-flex align-items-center gap-3 mb-3">
        <InputGroup style={{ maxWidth: 400 }}>
          <InputGroup.Text><i className="bi bi-search" /></InputGroup.Text>
          <Form.Control
            placeholder="Buscar por N, tipo, descripcion o presentante"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <Button variant="outline-secondary" onClick={() => setBusqueda("")}>X</Button>
          )}
        </InputGroup>
        <span className="text-muted small">
          {!loading && `${datos.length} resultado${datos.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Cargando expedientes</p>
        </div>
      )}

      {error && !loading && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && datos.length === 0 && (
        <Alert variant="info">
          No se encontraron expedientes{filtroEstado ? ` en estado "${filtroEstado}"` : ""}.
        </Alert>
      )}

      {!loading && !error && datos.length > 0 && (
        <Table striped bordered hover responsive className="align-middle">
          <thead className="table-dark">
            <tr>
              <th>N Expediente</th>
              <th>Tipo</th>
              <th>Descripcion</th>
              <th>Estado</th>
              <th>Presentante</th>
              {!ocultarAsignado && <th>Asignado a</th>}
              <th>Fecha Creacion</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((exp) => (
              <tr key={exp.id_expediente}>
                <td className="fw-semibold">{exp.numero_expediente ?? "-"}</td>
                <td>{exp.tipo_expediente ?? "-"}</td>
                <td>{exp.descripcion ?? "-"}</td>
                <td>
                  <Badge bg={getBadge(exp.estado_actual)}>
                    {exp.estado_actual ?? "Sin estado"}
                  </Badge>
                </td>
                <td>
                  {exp.usuario_presentante_nombre
                    ? `${exp.usuario_presentante_nombre} ${exp.usuario_presentante_apellido ?? ""}`
                    : "-"}
                </td>
                {!ocultarAsignado && (
                  <td>
                    {exp.usuario_asignado_nombre
                      ? `${exp.usuario_asignado_nombre} ${exp.usuario_asignado_apellido ?? ""}`
                      : <span className="text-muted fst-italic">Sin asignar</span>}
                  </td>
                )}
                <td>{formatFecha(exp.fecha_creacion)}</td>
                <td className="text-center">
                  {(exp.estado_actual ?? "").toLowerCase() === "en revision" ? (
                    <Button size="sm" variant="primary" onClick={() => setExpedienteModal(exp)}>
                      Realizar Pase
                    </Button>
                  ) : (
                    <span className="text-muted fst-italic small">Asignado</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {expedienteModal && (
        <ModalPase
          expediente={expedienteModal}
          onClose={() => setExpedienteModal(null)}
          onPaseExitoso={() => {}}
          onRemoveRow={handleRemoveRow}
        />
      )}
    </Container>
  );
}