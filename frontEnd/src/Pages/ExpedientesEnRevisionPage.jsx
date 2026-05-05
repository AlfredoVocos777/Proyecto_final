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
import { URL_EXPEDIENTES, URL_HISTORIAL, URL_USUARIOS, URL_OBSERVACIONES } from "../Constants/endpoints";

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

function formatAsignado(exp) {
  if (!exp?.usuario_asignado_nombre) return null;
  const nombre = `${exp.usuario_asignado_nombre} ${exp.usuario_asignado_apellido ?? ""}`.trim();
  const tipo = (exp.usuario_asignado_tipo ?? "").toLowerCase();
  if (tipo === "técnico" || tipo === "tecnico") return `${nombre} (TÉCNICO)`;
  if (tipo === "jurídico" || tipo === "juridico") return `${nombre} (JURÍDICO)`;
  if (tipo === "director") return `${nombre} (DIRECTOR)`;
  if (tipo === "administrador" || tipo === "administrativo") return `${nombre} (ADMINISTRADOR)`;
  return nombre;
}

function renderAsignado(exp) {
  if (!exp?.usuario_asignado_nombre) return null;
  const nombre = `${exp.usuario_asignado_nombre} ${exp.usuario_asignado_apellido ?? ""}`.trim();
  const tipo = (exp.usuario_asignado_tipo ?? "").toLowerCase();
  if (tipo === "técnico" || tipo === "tecnico") return <>{nombre} <strong>(TÉCNICO)</strong></>;
  if (tipo === "jurídico" || tipo === "juridico") return <>{nombre} <strong>(JURÍDICO)</strong></>;
  if (tipo === "director") return <>{nombre} <strong>(DIRECTOR)</strong></>;
  if (tipo === "administrador" || tipo === "administrativo") return <>{nombre} <strong>(ADMINISTRADOR)</strong></>;
  return nombre;
}

// ─── Modal Realizar Pase ─────────────────────────────────────────────────────
function ModalPase({ expediente, onClose, onPaseExitoso }) {
  const [tecnicos, setTecnicos]       = useState([]);
  const [documentos, setDocumentos]   = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [tecnicoId, setTecnicoId]     = useState("");
  const [enviando, setEnviando]       = useState(false);
  const [archivosPase, setArchivosPase] = useState([]);
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
    
    setEnviando(true);
    setFeedback(null);
    try {
      const tecnico = tecnicos.find((t) => String(t.id_usuario) === String(tecnicoId));
      await axios.post(URL_HISTORIAL, {
        id_expediente: expediente.id_expediente,
        id_usuario_responsable: tecnicoId,
        accion: "Pase a técnico",
        comentario: "Pase realizado por Administración",
        tipo_accion: "asignación",
      });

      // Subir documentos si hay (Restaurado)
      if (archivosPase.length > 0) {
        const user = JSON.parse(localStorage.getItem("usuarioLogueado"));
        const formData = new FormData();
        archivosPase.forEach(f => formData.append('files', f));
        formData.append('id_expediente', expediente.id_expediente);
        formData.append('subido_por', user?.id_usuario);
        await axios.post('http://localhost:8000/api/documentos/subirYRegistrar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      await axios.put(`${URL_EXPEDIENTES}/${expediente.id_expediente}`, {
        id_profesional_asignado: tecnicoId,
        estado_actual: "en revisión",
      });
      try {
        await axios.post(API_NOTIFICAR, {
          id_usuario: expediente.id_usuario_presentante,
          email: expediente.usuario_presentante_email ?? "",
          nombre: expediente.usuario_presentante_nombre ?? "",
          apellido: expediente.usuario_presentante_apellido ?? "",
          numero_expediente: expediente.numero_expediente,
          observacion: "Pase realizado por Administración",
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
  }, [tecnicoId, expediente, tecnicos, onClose, onPaseExitoso]);

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

        

        <hr />
        {/* Documentación adjunta agrupada por rol */}
        <div className="mb-4 p-3 bg-white border rounded">
          <p className="mb-2 fw-semibold text-uppercase text-secondary" style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}>Documentación adjunta</p>
          {loadingDocs ? (
            <p className="text-muted small">Cargando documentos…</p>
          ) : documentos.length === 0 ? (
            <p className="text-muted small">No hay documentos adjuntos.</p>
          ) : (() => {
            const rolOrder = ['Presentante', 'Administrativo'];
            const grupos = {};
            rolOrder.forEach(r => { grupos[r] = []; });
            documentos.forEach(doc => {
              const rol = doc.rol_nombre || 'Otro';
              if (grupos[rol]) grupos[rol].push(doc);
              else { grupos[rol] = [doc]; }
            });
            const nombresPorRol = {};
            documentos.forEach(doc => {
              if (doc.rol_nombre === 'Administrativo' && !nombresPorRol[doc.rol_nombre] && doc.subido_por_nombre) {
                nombresPorRol[doc.rol_nombre] = doc.subido_por_nombre;
              }
            });
            return (
              <div>
                {rolOrder.map(rol => {
                  const docs = grupos[rol] || [];
                  return (
                    <div key={rol} className="mb-3">
                      <h6 className="fw-bold" style={{ color: '#495057' }}>
                        {rol === 'Presentante' ? '👤' : rol === 'Técnico' ? '🔧' : '📁'} {rol}
                        {nombresPorRol[rol] && (
                          <span className="fw-normal text-muted ms-2" style={{ fontSize: '0.85rem' }}>— {nombresPorRol[rol]}</span>
                        )}
                      </h6>
                      {docs.length === 0 ? (
                        <p className="text-muted small ms-2">Sin archivos adjuntos</p>
                      ) : (
                        <Table size="sm" hover className="align-middle" style={{ fontSize: '0.875rem' }}>
                          <thead className="table-light">
                            <tr><th>Nombre</th><th>Tipo</th><th>Tamaño</th><th>Fecha</th><th></th></tr>
                          </thead>
                          <tbody>
                            {docs.map(doc => (
                              <tr key={doc.id_documento}>
                                <td title={doc.nombre_archivo} style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.nombre_archivo}</td>
                                <td>{doc.tipo}</td>
                                <td>{Math.round((doc.tamaño_archivo || 0) / 1024)} KB</td>
                                <td>{doc.fecha_subida ? new Date(doc.fecha_subida).toLocaleDateString("es-AR") : '—'}</td>
                                <td>
                                  <a href={`http://localhost:8000/api/documentos/ver/${doc.id_documento}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">Ver</a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        <hr />
        <h5>Informe Administrativo</h5>
        <Form.Group className="mb-3">
          <Form.Label>Adjuntar archivo</Form.Label>
          <Form.Control
            type="file"
            multiple
            onChange={(e) => setArchivosPase(Array.from(e.target.files))}
            disabled={enviando}
          />
          {archivosPase.length > 0 && (
            <Form.Text className="text-muted">{archivosPase.length} archivo(s) seleccionado(s)</Form.Text>
          )}
        </Form.Group>
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
       
        {feedback && <Alert variant={feedback.tipo} className="mb-0">{feedback.msg}</Alert>}
      </Modal.Body>
      <Modal.Footer>
        
        <Button variant="primary" onClick={handlePase} disabled={enviando || !tecnicoId }>
          {enviando ? <><Spinner size="sm" className="me-2" />Procesando…</> : "Confirmar Pase"}
        </Button>
        <Button variant="secondary" onClick={onClose} disabled={enviando}>Cancelar</Button>
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
            <><strong>Asignado a:</strong> {renderAsignado(expediente)}<br /></>
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
  const [observacionAdmin, setObservacionAdmin] = useState("");
  const [errorObs, setErrorObs]     = useState("");
  const [successObs, setSuccessObs] = useState("");
  const [subiendoObs, setSubiendoObs] = useState(false);
  const [observacionesExps, setObservacionesExps] = useState([]);

  const cargarObservaciones = async () => {
    if (!expediente) return;
    try {
      const res = await axios.get(`${URL_OBSERVACIONES}/${expediente.id_expediente}`);
      const data = res.data || {};
      const todas = [
        ...(data.Administrativo || []).map(o => ({ ...o, rol: 'Administrativo' }))
      ].sort((a,b) => new Date(b.fecha_hora) - new Date(a.fecha_hora));
      setObservacionesExps(todas);
    } catch (err) {
      console.error("Error al cargar observaciones:", err);
    }
  };

  const cargarHistorialYDocumentos = async () => {
    if (!expediente) return;
    setLoading(true);
    try {
      const [resHist, resDocs] = await Promise.all([
        axios.get(`${URL_HISTORIAL}/${expediente.id_expediente}`).catch(() => ({ data: [] })),
        axios.get(`${API_DOCS}/expediente/${expediente.id_expediente}`).catch(() => ({ data: [] })),
      ]);
      setHistorial(Array.isArray(resHist.data) ? resHist.data : []);
      setDocumentos(Array.isArray(resDocs.data) ? resDocs.data : []);
      await cargarObservaciones();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expediente) {
      setObservacionAdmin("");
      cargarHistorialYDocumentos();
    }
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
              <th>Teléfono presentante</th>
              <td>{expediente.usuario_presentante_telefono ?? <span className="text-muted fst-italic">Sin datos</span>}</td>
            </tr>
            <tr>
              <th>Asignado a</th>
              <td>
                {expediente.usuario_asignado_nombre
                  ? renderAsignado(expediente)
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

        <hr />
        <Form.Group className="mb-3">
          <Form.Label><strong>Observaciones para el Presentante:</strong></Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Escriba una observación para el PRESENTANTE del expediente..."
            value={observacionAdmin}
            onChange={(e) => { setObservacionAdmin(e.target.value); setErrorObs(""); }}
            isInvalid={!!errorObs}
            disabled={subiendoObs}
          />
          <Form.Control.Feedback type="invalid">{errorObs}</Form.Control.Feedback>
          <Button
            className="mt-2"
            size="sm"
            variant="primary"
            disabled={subiendoObs}
            onClick={async () => {
              if (!observacionAdmin.trim()) {
                setErrorObs("Debe escribir una observación antes de guardar.");
                return;
              }
              const user = JSON.parse(localStorage.getItem("usuarioLogueado"));
              setSubiendoObs(true);
              try {
                setSubiendoObs(true);
                // 1. Guardar observación para el presentante
                await axios.post(URL_OBSERVACIONES, {
                  id_expediente: expediente.id_expediente,
                  id_usuario: user.id_usuario,
                  observacion: observacionAdmin.trim()
                });
                // 2. Registrar en el historial para que aparezca en la tabla de abajo
                await axios.post(URL_HISTORIAL, {
                  id_expediente: expediente.id_expediente,
                  id_usuario_responsable: user.id_usuario,
                  accion: "Observación Administrativa",
                  comentario: observacionAdmin.trim(),
                  tipo_accion: "observación"
                });
                setSuccessObs("Observación guardada correctamente");
                setTimeout(() => setSuccessObs(""), 3000);
                setObservacionAdmin("");
                await cargarHistorialYDocumentos();
              } catch (err) {
                console.error(err);
                setErrorObs("No se pudo guardar la observación.");
              } finally {
                setSubiendoObs(false);
              }
            }}
          >
            {subiendoObs ? "Guardando..." : "Guardar Observación"}
          </Button>
          {/* Lista de observaciones enviadas */}
          <div className="mt-3" style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {observacionesExps.length > 0 && observacionesExps.map((obs, idx) => (
              <div key={idx} className="mb-1 d-flex align-items-start" style={{ fontSize: '0.85rem', color: '#555' }}>
                <span className="me-2" style={{ color: '#000' }}>•</span>
                <span>{obs.observacion}</span>
              </div>
            ))}
          </div>
        </Form.Group>

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

      {/* Notificación flotante de éxito para observaciones */}
      {successObs && (
        <div style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
          background: '#28a745', color: 'white', padding: '12px 24px',
          borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontWeight: '500', transition: 'opacity 0.3s ease-in-out'
        }}>
          ✅ {successObs}
        </div>
      )}
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
  const [fechaDesde, setFechaDesde]             = useState("");
  const [fechaHasta, setFechaHasta]             = useState("");
  const [mostrarPickerFecha, setMostrarPickerFecha] = useState(false);
  const [generando, setGenerando]               = useState(false);
  const [modalDeshacer, setModalDeshacer]       = useState(null); // expediente
  const [modalDetalle, setModalDetalle]         = useState(null); // expediente
  const [modalPase, setModalPase]               = useState(null); // expediente
  const [paginaActual, setPaginaActual]         = useState(1);
  const POR_PAGINA = 6;

  const cargarExpedientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filtroEstado) params.estado = filtroEstado;
      if (fechaDesde)  params.desde   = fechaDesde;
      if (fechaHasta)  params.hasta   = fechaHasta;
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
  }, [filtroEstado, fechaDesde, fechaHasta]);

  useEffect(() => {
    // Por defecto, filtrar el último mes
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(hoy.getMonth() - 1);
    const desdeStr = haceUnMes.toISOString().split('T')[0];
    setFechaDesde(desdeStr);
  }, []);

  useEffect(() => { cargarExpedientes(); }, [cargarExpedientes]);

  // Resetear página al cambiar búsqueda o filtro
  useEffect(() => { setPaginaActual(1); }, [busqueda, filtroEstado, fechaDesde, fechaHasta]);

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
              estado_actual: "en revisión",
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

  const totalPaginas = Math.ceil(datos.length / POR_PAGINA);
  const datosPagina = datos.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const btnPagStyle = (disabled) => ({
    minWidth: "36px", height: "36px", borderRadius: "8px",
    border: "1px solid #dee2e6",
    background: disabled ? "#f3f4f6" : "#fff",
    color: disabled ? "#9ca3af" : "#374151",
    fontWeight: 600, fontSize: "1rem",
    cursor: disabled ? "default" : "pointer",
    transition: "all 0.15s",
  });

  const exportarPDF = async () => {
    setGenerando(true);
    try {
      const params = {};
      if (filtroEstado) params.estado = filtroEstado;
      if (fechaDesde)  params.desde   = fechaDesde;
      if (fechaHasta)  params.hasta   = fechaHasta;
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
            ? formatAsignado(e)
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
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "12px",
              padding: "12px 16px",
              marginTop: "18px",
              marginBottom: "16px",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            {/* Izquierda: Volver + Buscador + Filtro */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>

              {/* Botón Volver */}
              <button
                onClick={() => navigate("/consulta-expedientes-estado")}
                style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  borderRadius: "8px",
                  padding: "0 14px",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "background 0.15s",
                  whiteSpace: "nowrap",
                  height: "36px",
                  letterSpacing: "0.02em",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.32)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
              >
                ← Volver
              </button>

              {/* Separador vertical */}
              <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.3)" }} />

              {/* Buscador */}
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span style={{
                  position: "absolute", left: "10px", color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", pointerEvents: "none"
                }}>🔍</span>
                <Form.Control
                  placeholder="Buscar expediente…"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1.5px solid rgba(255,255,255,0.35)",
                    borderRadius: "8px",
                    color: "#fff",
                    paddingLeft: "32px",
                    paddingRight: busqueda ? "32px" : "12px",
                    height: "36px",
                    fontSize: "0.87rem",
                    width: "240px",
                    outline: "none",
                  }}
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda("")}
                    style={{
                      position: "absolute", right: "8px",
                      background: "none", border: "none",
                      color: "rgba(255,255,255,0.7)", cursor: "pointer",
                      fontSize: "0.8rem", padding: 0, lineHeight: 1,
                    }}
                  >✕</button>
                )}
              </div>

              {/* Filtro estado */}
              <Form.Select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1.5px solid rgba(255,255,255,0.35)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontWeight: 500,
                  height: "36px",
                  fontSize: "0.87rem",
                  width: "170px",
                  cursor: "pointer",
                }}
              >
                <option value="en revisión" style={{ color: "#333" }}>En revisión</option>
                <option value="pendiente" style={{ color: "#333" }}>Pendiente</option>
                <option value="aprobado" style={{ color: "#333" }}>Aprobado</option>
                <option value="rechazado" style={{ color: "#333" }}>Rechazado</option>
              </Form.Select>

              {/* Filtro fecha rango */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setMostrarPickerFecha(v => !v)}
                  title={fechaDesde || fechaHasta ? `${fechaDesde || ""} — ${fechaHasta || ""}` : "Filtrar por fecha"}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    background: (fechaDesde || fechaHasta) ? "rgba(37,99,235,0.7)" : "rgba(255,255,255,0.15)",
                    color: "#fff",
                    border: (fechaDesde || fechaHasta) ? "1.5px solid rgba(99,160,255,0.7)" : "1.5px solid rgba(255,255,255,0.35)",
                    borderRadius: "8px",
                    height: "36px",
                    padding: "0 12px",
                    fontSize: "1rem",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  📅
                  {(fechaDesde || fechaHasta) && (
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {fechaDesde || "…"} — {fechaHasta || "…"}
                    </span>
                  )}
                </button>

                {mostrarPickerFecha && (
                  <div
                    style={{
                      position: "absolute", top: "44px", left: 0, zIndex: 9999,
                      background: "#fff",
                      borderRadius: "12px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                      padding: "16px 20px",
                      minWidth: "260px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <p style={{ margin: "0 0 10px", fontWeight: 700, color: "#1e3a5f", fontSize: "0.9rem" }}>Rango de fechas</p>
                    <div style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", fontSize: "0.78rem", color: "#6b7280", marginBottom: "4px", fontWeight: 600 }}>Desde</label>
                      <input
                        type="date"
                        value={fechaDesde}
                        max={fechaHasta || undefined}
                        onChange={(e) => setFechaDesde(e.target.value)}
                        style={{ width: "100%", borderRadius: "6px", border: "1px solid #d1d5db", padding: "5px 8px", fontSize: "0.88rem" }}
                      />
                    </div>
                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ display: "block", fontSize: "0.78rem", color: "#6b7280", marginBottom: "4px", fontWeight: 600 }}>Hasta</label>
                      <input
                        type="date"
                        value={fechaHasta}
                        min={fechaDesde || undefined}
                        onChange={(e) => setFechaHasta(e.target.value)}
                        style={{ width: "100%", borderRadius: "6px", border: "1px solid #d1d5db", padding: "5px 8px", fontSize: "0.88rem" }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => { setFechaDesde(""); setFechaHasta(""); }}
                        style={{ flex: 1, padding: "6px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#f9fafb", fontSize: "0.82rem", cursor: "pointer", fontWeight: 600, color: "#6b7280" }}
                      >Limpiar</button>
                      <button
                        onClick={() => setMostrarPickerFecha(false)}
                        style={{ flex: 1, padding: "6px", borderRadius: "6px", border: "none", background: "#2563eb", color: "#fff", fontSize: "0.82rem", cursor: "pointer", fontWeight: 600 }}
                      >Aplicar</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Derecha: Contador + PDF */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {!loading && (
                <span style={{
                  background: "rgba(255,255,255,0.18)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  padding: "0 14px",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.3)",
                  whiteSpace: "nowrap",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  letterSpacing: "0.02em",
                }}>
                  {datos.length} resultado{datos.length !== 1 ? "s" : ""}
                </span>
              )}

              <button
                onClick={async () => {
                  const url = await exportarPDF();
                  if (url) window.open(url, "_blank");
                }}
                disabled={generando}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: generando ? "rgba(147,197,253,0.8)" : "rgba(37,99,235,0.9)",
                  color: "#fff",
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  borderRadius: "8px",
                  padding: "0 18px",
                  fontWeight: 600,
                  fontSize: "0.87rem",
                  cursor: generando ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                  height: "36px",
                  letterSpacing: "0.02em",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
                onMouseEnter={e => { if (!generando) e.currentTarget.style.background = "rgba(29,78,216,0.95)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = generando ? "rgba(147,197,253,0.8)" : "rgba(37,99,235,0.9)"; }}
              >
                📄 {generando ? "Generando…" : "Generar PDF"}
              </button>
            </div>
          </div>

          {/* Contenido */}
          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Cargando expedientes…</p>
            </div>
          )}

          <hr />

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
                  {datosPagina.map((exp) => {
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
                            ? renderAsignado(exp)
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

              {/* Paginación */}
              {totalPaginas > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", marginTop: "12px", marginBottom: "8px" }}>
                  <button
                    onClick={() => setPaginaActual(1)}
                    disabled={paginaActual === 1}
                    style={btnPagStyle(paginaActual === 1)}
                  >«</button>
                  <button
                    onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                    disabled={paginaActual === 1}
                    style={btnPagStyle(paginaActual === 1)}
                  >‹</button>
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      onClick={() => setPaginaActual(n)}
                      style={{
                        minWidth: "36px", height: "36px", borderRadius: "8px",
                        border: n === paginaActual ? "none" : "1px solid #dee2e6",
                        background: n === paginaActual ? "#2563eb" : "#fff",
                        color: n === paginaActual ? "#fff" : "#374151",
                        fontWeight: n === paginaActual ? 700 : 500,
                        fontSize: "0.9rem", cursor: "pointer",
                        boxShadow: n === paginaActual ? "0 2px 6px rgba(37,99,235,0.35)" : "none",
                        transition: "all 0.15s",
                      }}
                    >{n}</button>
                  ))}
                  <button
                    onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                    disabled={paginaActual === totalPaginas}
                    style={btnPagStyle(paginaActual === totalPaginas)}
                  >›</button>
                  <button
                    onClick={() => setPaginaActual(totalPaginas)}
                    disabled={paginaActual === totalPaginas}
                    style={btnPagStyle(paginaActual === totalPaginas)}
                  >»</button>
                </div>
              )}
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
