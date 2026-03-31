import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table, Badge, Spinner, Alert, Form, InputGroup,
  Button, Modal, Container
} from "react-bootstrap";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Header_1 from "../Components/Header_1";
import Footer from "../Components/Footer";
import { URL_EXPEDIENTES, URL_HISTORIAL, URL_USUARIOS } from "../Constants/endpoints";

const API_DOCS    = "http://localhost:8000/api/documentos";
const API_NOTIFICAR = "http://localhost:8000/api/notificar-pase";

const BADGE_ESTADO = {
  "pendiente":   "warning",
  "en revisión": "info",
  "asignado":    "primary",
  "aprobado":    "success",
  "rechazado":   "danger",
  "archivado":   "secondary",
  "finalizado":  "dark",
};

function getBadge(estado) {
  return BADGE_ESTADO[(estado ?? "").toLowerCase()] ?? "primary";
}

function formatFecha(fecha) {
  if (!fecha) return "-";
  return new Date(fecha).toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

// ─── Modal Realizar Pase ─────────────────────────────────────────────────────
function ModalPase({ expediente, onClose, onPaseExitoso }) {
  const [tecnicos, setTecnicos]       = useState([]);
  const [documentos, setDocumentos]   = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [tecnicoId, setTecnicoId]     = useState("");
  const [observacion, setObservacion] = useState("");
  const [enviando, setEnviando]       = useState(false);
  const [feedback, setFeedback]       = useState(null);

  useEffect(() => {
    if (!expediente) return;
    setLoadingDocs(true);
    axios.get(`${API_DOCS}/expediente/${expediente.id_expediente}`)
      .then((r) => setDocumentos(Array.isArray(r.data) ? r.data : []))
      .catch(() => setDocumentos([]))
      .finally(() => setLoadingDocs(false));

    axios.get(URL_USUARIOS)
      .then((r) => {
        const lista = Array.isArray(r.data) ? r.data : [];
        setTecnicos(lista.filter((u) => (u.tipo_usuario ?? "").toLowerCase() === "técnico"));
      })
      .catch(() => setTecnicos([]));
  }, [expediente]);

  const handlePase = useCallback(async () => {
    if (!tecnicoId) { setFeedback({ tipo: "warning", msg: "Seleccioná un técnico." }); return; }
    if (!observacion.trim()) { setFeedback({ tipo: "warning", msg: "Ingresá una observación." }); return; }
    setEnviando(true);
    setFeedback(null);
    try {
      const tecnico = tecnicos.find((t) => String(t.id_usuario) === String(tecnicoId));
      await axios.post(URL_HISTORIAL, {
        id_expediente: expediente.id_expediente,
        id_usuario_responsable: tecnicoId,
        accion: "Pase a técnico",
        comentario: observacion,
        tipo_accion: "asignación",
      });
      await axios.put(`${URL_EXPEDIENTES}/${expediente.id_expediente}`, {
        id_profesional_asignado: tecnicoId,
        estado_actual: "asignado",
      });
      try {
        await axios.post(API_NOTIFICAR, {
          id_usuario: expediente.id_usuario_presentante,
          email: expediente.email_presentante ?? "",
          nombre: expediente.usuario_presentante_nombre ?? "",
          apellido: expediente.usuario_presentante_apellido ?? "",
          numero_expediente: expediente.numero_expediente,
          observacion,
          tecnico_nombre: tecnico ? `${tecnico.nombre} ${tecnico.apellido}` : "",
        });
      } catch (_) { /* no crítico */ }
      setFeedback({ tipo: "success", msg: `Pase realizado al técnico ${tecnico?.nombre ?? ""} ${tecnico?.apellido ?? ""}.` });
      setTimeout(() => { onPaseExitoso(expediente.id_expediente, tecnico); onClose(); }, 1600);
    } catch {
      setFeedback({ tipo: "danger", msg: "Error al realizar el pase." });
    } finally {
      setEnviando(false);
    }
  }, [tecnicoId, observacion, expediente, tecnicos, onClose, onPaseExitoso]);

  if (!expediente) return null;
  return (
    <Modal show onHide={onClose} size="lg" centered backdrop="static">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>📤 Realizar Pase — Exp. N° {expediente.numero_expediente}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="rounded p-3 mb-3 border bg-light">
          <div className="row g-2">
            <div className="col-md-6"><strong>Tipo:</strong> {expediente.tipo_expediente ?? "-"}</div>
            <div className="col-md-6"><strong>Estado:</strong> <Badge bg={getBadge(expediente.estado_actual)}>{expediente.estado_actual ?? "-"}</Badge></div>
            <div className="col-md-6"><strong>Presentante:</strong> {expediente.usuario_presentante_nombre ? `${expediente.usuario_presentante_nombre} ${expediente.usuario_presentante_apellido ?? ""}` : "-"}</div>
            <div className="col-md-6"><strong>Fecha:</strong> {formatFecha(expediente.fecha_creacion)}</div>
          </div>
        </div>

        <h6 className="fw-bold">Documentos adjuntos</h6>
        {loadingDocs ? (
          <div className="text-center py-2"><Spinner size="sm" /> Cargando…</div>
        ) : documentos.length === 0 ? (
          <Alert variant="secondary" className="py-2">Sin documentos.</Alert>
        ) : (
          <ul className="list-group mb-3">
            {documentos.map((doc) => (
              <li key={doc.id_documento} className="list-group-item d-flex justify-content-between align-items-center">
                <span>📎 {doc.nombre_archivo}</span>
                <Button size="sm" variant="outline-primary"
                  href={`${API_DOCS}/ver/${doc.id_documento}`} target="_blank" rel="noopener noreferrer">Ver</Button>
              </li>
            ))}
          </ul>
        )}

        <hr />
        <Form.Group className="mb-3">
          <Form.Label>Técnico destino <span className="text-danger">*</span></Form.Label>
          <Form.Select value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)}>
            <option value="">— Seleccioná un técnico —</option>
            {tecnicos.map((t) => (
              <option key={t.id_usuario} value={t.id_usuario}>{t.nombre} {t.apellido}</option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Observaciones <span className="text-danger">*</span></Form.Label>
          <Form.Control as="textarea" rows={3} value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder="Motivo del pase o indicaciones…" />
        </Form.Group>
        {feedback && <Alert variant={feedback.tipo} className="mb-0">{feedback.msg}</Alert>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={enviando}>Cancelar</Button>
        <Button variant="primary" onClick={handlePase} disabled={enviando || !tecnicoId || !observacion.trim()}>
          {enviando ? <><Spinner size="sm" className="me-2" />Procesando…</> : "Confirmar Pase"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// ─── Modal confirmar deshacer pase ──────────────────────────────────────────
function ModalDeshacerPase({ expediente, onClose, onExito }) {
  const [procesando, setProcesando] = useState(false);
  const [feedback, setFeedback]     = useState(null);

  const confirmar = async () => {
    setProcesando(true);
    setFeedback(null);
    try {
      await axios.delete(`${URL_HISTORIAL}/deshacer-pase/${expediente.id_expediente}`);
      setFeedback({ tipo: "success", msg: "Pase deshecho correctamente. El expediente volvió a estado 'en revisión'." });
      setTimeout(() => { onExito(expediente.id_expediente); onClose(); }, 1600);
    } catch (err) {
      const msg = err.response?.data?.error ?? "Error al deshacer el pase. Verificá la conexión.";
      setFeedback({ tipo: "danger", msg });
    } finally {
      setProcesando(false);
    }
  };

  if (!expediente) return null;
  return (
    <Modal show onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton className="bg-warning">
        <Modal.Title>⚠️ Deshacer Pase</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>¿Estás seguro de que querés deshacer el último pase del expediente?</p>
        <div className="rounded p-3 mb-2 border bg-light">
          <strong>N°:</strong> {expediente.numero_expediente}<br />
          <strong>Tipo:</strong> {expediente.tipo_expediente ?? "-"}<br />
          <strong>Estado actual:</strong>{" "}
          <Badge bg={getBadge(expediente.estado_actual)}>{expediente.estado_actual ?? "-"}</Badge><br />
          {expediente.usuario_asignado_nombre && (
            <><strong>Asignado a:</strong> {expediente.usuario_asignado_nombre} {expediente.usuario_asignado_apellido ?? ""}<br /></>
          )}
        </div>
        <p className="text-muted small mb-0">
          El expediente volverá al estado <strong>"en revisión"</strong> y se quitará la asignación actual.
        </p>
        {feedback && <Alert variant={feedback.tipo} className="mt-3 mb-0">{feedback.msg}</Alert>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={procesando}>Cancelar</Button>
        <Button variant="danger" onClick={confirmar} disabled={procesando}>
          {procesando ? <><Spinner size="sm" className="me-2" />Procesando…</> : "Sí, deshacer pase"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// ─── Modal detalle del expediente ────────────────────────────────────────────
function ModalDetalle({ expediente, onClose }) {
  const [historial, setHistorial]   = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!expediente) return;
    setLoading(true);
    Promise.all([
      axios.get(`${URL_HISTORIAL}/${expediente.id_expediente}`).catch(() => ({ data: [] })),
      axios.get(`${API_DOCS}/expediente/${expediente.id_expediente}`).catch(() => ({ data: [] })),
    ]).then(([resHist, resDocs]) => {
      setHistorial(Array.isArray(resHist.data) ? resHist.data : []);
      setDocumentos(Array.isArray(resDocs.data) ? resDocs.data : []);
    }).finally(() => setLoading(false));
  }, [expediente]);

  if (!expediente) return null;
  return (
    <Modal show onHide={onClose} size="lg" centered scrollable>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>📄 Expediente N° {expediente.numero_expediente}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Datos generales */}
        <h6 className="fw-bold">Datos del Expediente</h6>
        <Table bordered size="sm" className="mb-4">
          <tbody>
            <tr><th width="35%">Número</th><td>{expediente.numero_expediente}</td></tr>
            <tr><th>Tipo</th><td>{expediente.tipo_expediente ?? "-"}</td></tr>
            <tr><th>Descripción</th><td>{expediente.descripcion ?? "-"}</td></tr>
            <tr><th>Estado</th><td><Badge bg={getBadge(expediente.estado_actual)}>{expediente.estado_actual ?? "-"}</Badge></td></tr>
            <tr><th>Prioridad</th><td>{expediente.prioridad ?? "-"}</td></tr>
            <tr><th>Fecha Creación</th><td>{formatFecha(expediente.fecha_creacion)}</td></tr>
            <tr>
              <th>Presentante</th>
              <td>
                {expediente.usuario_presentante_nombre
                  ? `${expediente.usuario_presentante_nombre} ${expediente.usuario_presentante_apellido ?? ""}`
                  : "-"}
              </td>
            </tr>
            <tr>
              <th>Asignado a</th>
              <td>
                {expediente.usuario_asignado_nombre
                  ? `${expediente.usuario_asignado_nombre} ${expediente.usuario_asignado_apellido ?? ""}`
                  : <span className="text-muted fst-italic">Sin asignar</span>}
              </td>
            </tr>
          </tbody>
        </Table>

        {/* Documentos */}
        <h6 className="fw-bold">Documentos adjuntos</h6>
        {loading ? (
          <div className="text-center py-2"><Spinner size="sm" /> Cargando…</div>
        ) : documentos.length === 0 ? (
          <Alert variant="secondary" className="py-2">Sin documentos adjuntos.</Alert>
        ) : (
          <ul className="list-group mb-4">
            {documentos.map((doc) => (
              <li key={doc.id_documento} className="list-group-item d-flex justify-content-between align-items-center">
                <span>📎 {doc.nombre_archivo}</span>
                <Button size="sm" variant="outline-primary"
                  href={`${API_DOCS}/ver/${doc.id_documento}`} target="_blank" rel="noopener noreferrer">
                  Ver
                </Button>
              </li>
            ))}
          </ul>
        )}

        {/* Historial */}
        <h6 className="fw-bold">Historial de acciones</h6>
        {loading ? (
          <div className="text-center py-2"><Spinner size="sm" /> Cargando…</div>
        ) : historial.length === 0 ? (
          <Alert variant="secondary" className="py-2">Sin historial registrado.</Alert>
        ) : (
          <Table bordered size="sm" responsive>
            <thead className="table-secondary">
              <tr>
                <th>Fecha</th><th>Acción</th><th>Responsable</th><th>Comentario</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h) => (
                <tr key={h.id_historial}>
                  <td>{formatFecha(h.fecha)}</td>
                  <td>{h.accion}</td>
                  <td>{h.usuario_nombre ? `${h.usuario_nombre} ${h.usuario_apellido ?? ""}` : "-"}</td>
                  <td>{h.comentario ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ExpedientesEnRevisionPage() {
  const navigate    = useNavigate();
  const [expedientes, setExpedientes]           = useState([]);
  const [pasesPorExp, setPasesPorExp]           = useState({}); // id_expediente → true/false
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);
  const [busqueda, setBusqueda]                 = useState("");
  const [filtroEstado, setFiltroEstado]         = useState("en revisión");
  const [generando, setGenerando]               = useState(false);
  const [modalDeshacer, setModalDeshacer]       = useState(null); // expediente
  const [modalDetalle, setModalDetalle]         = useState(null); // expediente
  const [modalPase, setModalPase]               = useState(null); // expediente

  const cargarExpedientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filtroEstado ? { estado: filtroEstado } : {};
      const res = await axios.get(URL_EXPEDIENTES, { params });
      const lista = Array.isArray(res.data) ? res.data : [];
      setExpedientes(lista);

      // Detectar cuáles tienen pase en historial
      const historialResults = await Promise.allSettled(
        lista.map((exp) =>
          axios.get(`${URL_HISTORIAL}/${exp.id_expediente}`).then((r) => ({
            id: exp.id_expediente,
            data: Array.isArray(r.data) ? r.data : [],
          }))
        )
      );

      const mapa = {};
      historialResults.forEach((result) => {
        if (result.status === "fulfilled") {
          const { id, data } = result.value;
          const tienePase = data.some(
            (h) =>
              (h.tipo_accion ?? "").toLowerCase() === "asignación" ||
              (h.accion ?? "").toLowerCase().includes("pase") ||
              (h.accion ?? "").toLowerCase().includes("asignaci")
          );
          mapa[id] = tienePase;
        }
      });
      setPasesPorExp(mapa);
    } catch (err) {
      setError("No se pudieron cargar los expedientes. Verificá que el servidor esté activo.");
    } finally {
      setLoading(false);
    }
  }, [filtroEstado]);

  useEffect(() => { cargarExpedientes(); }, [cargarExpedientes]);

  const handleDeshacerExito = (id_expediente) => {
    setExpedientes((prev) =>
      prev.map((e) =>
        e.id_expediente === id_expediente
          ? { ...e, estado_actual: "en revisión", usuario_asignado_nombre: null, id_profesional_asignado: null }
          : e
      )
    );
    setPasesPorExp((prev) => ({ ...prev, [id_expediente]: false }));
  };

  const handlePaseExitoso = (id_expediente, tecnico) => {
    setExpedientes((prev) =>
      prev.map((e) =>
        e.id_expediente === id_expediente
          ? {
              ...e,
              estado_actual: "asignado",
              usuario_asignado_nombre: tecnico?.nombre ?? "",
              usuario_asignado_apellido: tecnico?.apellido ?? "",
              id_profesional_asignado: tecnico?.id_usuario ?? null,
            }
          : e
      )
    );
    setPasesPorExp((prev) => ({ ...prev, [id_expediente]: true }));
  };

  const datos = expedientes.filter((exp) => {
    const texto = busqueda.toLowerCase();
    return (
      (exp.numero_expediente ?? "").toLowerCase().includes(texto) ||
      (exp.tipo_expediente ?? "").toLowerCase().includes(texto) ||
      (exp.descripcion ?? "").toLowerCase().includes(texto) ||
      (`${exp.usuario_presentante_nombre ?? ""} ${exp.usuario_presentante_apellido ?? ""}`).toLowerCase().includes(texto)
    );
  });

  const exportarPDF = async () => {
    setGenerando(true);
    try {
      const params = filtroEstado ? { estado: filtroEstado } : {};
      const res = await axios.get(URL_EXPEDIENTES, { params });
      const lista = Array.isArray(res.data) ? res.data : [];

      const doc = new jsPDF();
      const fecha = new Date().toLocaleString("es-AR");
      doc.setFontSize(14);
      doc.text(`Reporte de Expedientes${filtroEstado ? ` — ${filtroEstado}` : ""}`, 14, 15);
      doc.setFontSize(10);
      doc.text(`Fecha: ${fecha}`, 14, 22);

      autoTable(doc, {
        startY: 28,
        columns: [
          { header: "N° Expediente", dataKey: "numero_expediente" },
          { header: "Tipo", dataKey: "tipo_expediente" },
          { header: "Descripción", dataKey: "descripcion" },
          { header: "Estado", dataKey: "estado_actual" },
          { header: "Presentante", dataKey: "presentante" },
          { header: "Asignado a", dataKey: "asignado" },
          { header: "Fecha", dataKey: "fecha" },
        ],
        body: lista.map((e) => ({
          numero_expediente: e.numero_expediente ?? "",
          tipo_expediente: e.tipo_expediente ?? "",
          descripcion: e.descripcion ?? "",
          estado_actual: e.estado_actual ?? "",
          presentante: e.usuario_presentante_nombre
            ? `${e.usuario_presentante_nombre} ${e.usuario_presentante_apellido ?? ""}`.trim()
            : "",
          asignado: e.usuario_asignado_nombre
            ? `${e.usuario_asignado_nombre} ${e.usuario_asignado_apellido ?? ""}`.trim()
            : "Sin asignar",
          fecha: e.fecha_creacion ? new Date(e.fecha_creacion).toLocaleDateString("es-AR") : "",
        })),
      });

      return doc.output("bloburl");
    } catch (err) {
      alert(`No se pudo generar el reporte: ${err?.message ?? err}`);
      return null;
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div>
      <Header_1 />
      <div className="admin-hero" style={{ alignItems: "flex-start", paddingTop: "80px" }}>
        <div className="admin-wrap" style={{ maxWidth: "1400px", width: "100%", padding: "0 24px" }}>
          <h1 className="admin-title">Expedientes en revisión</h1>
          <p className="admin-subtitle">Consulta de expedientes con opción de deshacer pases realizados</p>

          {/* Panel de controles unificado */}
          <div
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.13)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "14px",
              padding: "18px 24px",
              marginTop: "18px",
              marginBottom: "16px",
              backdropFilter: "blur(8px)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {/* Botón Volver */}
            <button
              onClick={() => navigate("/consulta-expedientes-estado")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(255,255,255,0.95)",
                color: "#4b5563",
                border: "1.5px solid rgba(255,255,255,0.7)",
                borderRadius: "8px",
                padding: "7px 18px",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.18s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.95)"}
            >
              ← Volver
            </button>

            {/* Buscador */}
            <InputGroup style={{ flex: "1 1 260px", minWidth: "200px" }}>
              <InputGroup.Text
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: "1.5px solid rgba(255,255,255,0.6)",
                  borderRight: "none",
                  color: "#555",
                }}
              >
                🔍
              </InputGroup.Text>
              <Form.Control
                placeholder="Buscar por N°, tipo, descripción o presentante…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: "1.5px solid rgba(255,255,255,0.6)",
                  borderLeft: "none",
                }}
              />
              {busqueda && (
                <Button
                  variant="light"
                  onClick={() => setBusqueda("")}
                  style={{ border: "1.5px solid rgba(255,255,255,0.6)" }}
                >
                  ✕
                </Button>
              )}
            </InputGroup>

            {/* Filtro estado */}
            <Form.Select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{
                flex: "0 0 auto",
                width: "auto",
                minWidth: "180px",
                background: "rgba(255,255,255,0.9)",
                border: "1.5px solid rgba(255,255,255,0.6)",
                fontWeight: 500,
              }}
            >
              <option value="">— Todos los estados —</option>
              <option value="en revisión">En revisión</option>
              <option value="asignado">Asignado</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
            </Form.Select>

            {/* Contador */}
            {!loading && (
              <span
                style={{
                  background: "rgba(255,255,255,0.18)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.35)",
                  whiteSpace: "nowrap",
                }}
              >
                {datos.length} resultado{datos.length !== 1 ? "s" : ""}
              </span>
            )}

            {/* Spacer */}
            <div style={{ flex: "1 1 0" }} />

            {/* Botón PDF */}
            <button
              onClick={async () => {
                const url = await exportarPDF();
                if (url) window.open(url, "_blank");
              }}
              disabled={generando}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                background: generando ? "#93c5fd" : "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "7px 20px",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: generando ? "not-allowed" : "pointer",
                transition: "all 0.18s",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
              }}
              onMouseEnter={e => { if (!generando) e.currentTarget.style.opacity = "0.88"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
            >
              {generando ? "Generando…" : "📄 Generar reporte PDF"}
            </button>
          </div>

          {/* Contenido */}
          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Cargando expedientes…</p>
            </div>
          )}

          {error && !loading && <Alert variant="danger">{error}</Alert>}

          {!loading && !error && datos.length === 0 && (
            <Alert variant="info">
              No se encontraron expedientes{filtroEstado ? ` en estado "${filtroEstado}"` : ""}.
            </Alert>
          )}

          {!loading && !error && datos.length > 0 && (
            <Container fluid className="px-0">
              <Table striped bordered hover responsive className="align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>N° Expediente</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th>Presentante</th>
                    <th>Asignado a</th>
                    <th>Fecha Creación</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.map((exp) => {
                    const tienePase = !!pasesPorExp[exp.id_expediente];
                    return (
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
                        <td>
                          {exp.usuario_asignado_nombre
                            ? `${exp.usuario_asignado_nombre} ${exp.usuario_asignado_apellido ?? ""}`
                            : <span className="text-muted fst-italic">Sin asignar</span>}
                        </td>
                        <td>{formatFecha(exp.fecha_creacion)}</td>
                        <td className="text-center">
                          <div className="d-flex gap-2 justify-content-center flex-wrap">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => setModalDetalle(exp)}
                            >
                              👁️ Ver
                            </Button>
                            {!exp.usuario_asignado_nombre && (
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => setModalPase(exp)}
                              >
                                📤 Realizar Pase
                              </Button>
                            )}
                            {tienePase && (
                              <Button
                                size="sm"
                                variant="warning"
                                onClick={() => setModalDeshacer(exp)}
                              >
                                ↩️ Deshacer Pase
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Container>
          )}
        </div>
      </div>
      <Footer />

      {/* Modales */}
      {modalDetalle && (
        <ModalDetalle
          expediente={modalDetalle}
          onClose={() => setModalDetalle(null)}
        />
      )}
      {modalPase && (
        <ModalPase
          expediente={modalPase}
          onClose={() => setModalPase(null)}
          onPaseExitoso={handlePaseExitoso}
        />
      )}
      {modalDeshacer && (
        <ModalDeshacerPase
          expediente={modalDeshacer}
          onClose={() => setModalDeshacer(null)}
          onExito={handleDeshacerExito}
        />
      )}
    </div>
  );
}
