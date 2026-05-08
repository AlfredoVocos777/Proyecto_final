import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table, Badge, Spinner, Alert, Form, InputGroup,
  Button, Modal, Container, Accordion
} from "react-bootstrap";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Header_1 from "../Components/Header_1";
import Footer from "../Components/Footer";
import "../CSS/DocumentacionAdjunta.css";
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
  
  let rolLabel = '';
  if (tipo === "técnico" || tipo === "tecnico") rolLabel = "ÁREA TÉCNICA";
  else if (tipo === "jurídico" || tipo === "juridico") rolLabel = "ÁREA JURÍDICA";
  else if (tipo === "director") rolLabel = "DIRECCIÓN";
  else if (tipo === "administrador" || tipo === "administrativo") rolLabel = "ADMINISTRACIÓN";
  else rolLabel = tipo.toUpperCase();

  return `${rolLabel} (${nombre})`;
}

function renderAsignado(exp) {
  if (!exp?.usuario_asignado_nombre) return null;
  const nombre = `${exp.usuario_asignado_nombre} ${exp.usuario_asignado_apellido ?? ""}`.trim();
  const tipo = (exp.usuario_asignado_tipo ?? "").toLowerCase();

  let rolLabel = '';
  if (tipo === "técnico" || tipo === "tecnico") rolLabel = "Área Técnica";
  else if (tipo === "jurídico" || tipo === "juridico") rolLabel = "Área Jurídica";
  else if (tipo === "director") rolLabel = "Dirección";
  else if (tipo === "administrador" || tipo === "administrativo") rolLabel = "Administración";
  else rolLabel = tipo.charAt(0).toUpperCase() + tipo.slice(1);

  return (
    <span className="ms-1">
      <strong>{rolLabel}</strong> <span className="text-muted small">({nombre})</span>
    </span>
  );
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
        formData.append('categoria', 'informe_administrativo'); // Categorizamos el archivo
        await axios.post(`${API_DOCS}/subirYRegistrar`, formData, {
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
        {/* Documentación adjunta categorizada (Estilo Acordeón) */}
        <div className="mb-4">
          <span className="modal-seccion-header">Documentación del Expediente</span>
          {loadingDocs ? (
            <div className="text-center py-2"><Spinner size="sm" /> Cargando…</div>
          ) : (
            (() => {
              const categories = [
                { id: "0", label: "DNI del presentante (frente y dorso)", key: "dni" },
                { id: "1", label: "Nota de elevación (con firma y aclaración)", key: "nota" },
                { id: "2", label: "Plano de ubicación de proyecto", key: "plano" },
                { id: "3", label: "Memoria descriptiva", key: "memoria" },
                { id: "4", label: "Título de propiedad o boleto de compra venta", key: "titulo" }
              ];

              return (
                <>
                  {/* SECCIÓN: PRESENTANTE */}
                  <div className="seccion-titulo-premium">
                    <i className="bi bi-person-fill"></i>
                    <h6>Presentante</h6>
                  </div>

                  <Accordion className="accordion-maestro shadow-sm rounded">
                    <Accordion.Item eventKey="presentante-master">
                      <Accordion.Header>
                        <span className="fw-medium">Documentación</span>
                      </Accordion.Header>
                      <Accordion.Body className="p-0 border-0">
                        <Accordion defaultActiveKey={null} className="accordion-documentos-internos">
                          {categories.map((cat) => {
                            const archivosAMostrar = documentos.filter(doc => {
                              if (doc.categoria) return doc.categoria === cat.key;
                              const nombre = doc.nombre_archivo.toLowerCase();
                              if (cat.key === 'dni' && (nombre.includes('dni') || nombre.includes('frente') || nombre.includes('dorso'))) return true;
                              if (cat.key === 'nota' && (nombre.includes('nota') || nombre.includes('elevacion'))) return true;
                              if (cat.key === 'plano' && (nombre.includes('plano') || nombre.includes('ubicacion'))) return true;
                              if (cat.key === 'memoria' && nombre.includes('memoria')) return true;
                              if (cat.key === 'titulo' && (nombre.includes('titulo') || nombre.includes('propiedad') || nombre.includes('boleto'))) return true;
                              return false;
                            });

                            return (
                              <Accordion.Item eventKey={cat.id} key={cat.id}>
                                <Accordion.Header>
                                  <div className="d-flex justify-content-between w-100 me-3">
                                    <span>{cat.label}</span>
                                    <Badge bg={archivosAMostrar.length > 0 ? "primary" : "secondary"} pill className="badge-archivos-count">
                                      {archivosAMostrar.length} {archivosAMostrar.length === 1 ? 'archivo' : 'archivos'}
                                    </Badge>
                                  </div>
                                </Accordion.Header>
                                <Accordion.Body className="bg-light p-2">
                                  <div className="listado-archivos-categoria">
                                    {archivosAMostrar.length === 0 ? (
                                      <p className="text-muted small mb-0 p-2">No hay archivos en esta categoría.</p>
                                    ) : (
                                      archivosAMostrar.map((doc) => (
                                        <div key={doc.id_documento} className="doc-subido-item-nuevo mb-2 p-2 border rounded d-flex justify-content-between align-items-center shadow-sm bg-white">
                                          <div className="d-flex align-items-center overflow-hidden">
                                            <i className="bi bi-file-earmark-pdf text-danger me-2 fs-5"></i>
                                            <div className="text-truncate">
                                              <p className="mb-0 fw-medium text-truncate doc-nombre">{doc.nombre_archivo}</p>
                                              <small className="doc-meta">
                                                Subido el {new Date(doc.fecha_subida).toLocaleDateString()} — {doc.subido_por_nombre || 'Presentante'}
                                              </small>
                                            </div>
                                          </div>
                                          <div className="d-flex gap-2">
                                            <Button 
                                              size="sm" 
                                              variant="outline-primary"
                                              className="d-flex align-items-center gap-1 py-1 px-2"
                                              style={{ fontSize: '0.75rem' }}
                                              href={`http://localhost:8000/api/documentos/ver/${doc.id_documento}`} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                            >
                                              <i className="bi bi-eye"></i> Ver
                                            </Button>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </Accordion.Body>
                              </Accordion.Item>
                            );
                          })}
                        </Accordion>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </>
              );
            })()
          )}
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
          <Form.Label>Enviar a <strong>área técnica</strong> <span className="text-danger">*</span></Form.Label>
          <Form.Select value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)}>
            <option value="">— Seleccioná un técnico —</option>
            {tecnicos.map((t) => (
              <option key={t.id_usuario} value={t.id_usuario}>
                {t.nombre} {t.apellido}
              </option>
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
        <span className="modal-seccion-header">Datos del Expediente</span>
        <div className="expediente-datos-grid mb-4">
          <div className="row g-3">
            <div className="col-md-6 dato-item">
              <span className="dato-label">Número</span>
              <span className="dato-valor">{expediente.numero_expediente}</span>
            </div>
            <div className="col-md-6 dato-item">
              <span className="dato-label">Tipo de Expediente</span>
              <span className="dato-valor">{expediente.tipo_expediente ?? "-"}</span>
            </div>
            
            <div className="col-md-6 dato-item">
              <span className="dato-label">Estado Actual</span>
              <Badge bg={getBadge(expediente.estado_actual)}>{expediente.estado_actual ?? "-"}</Badge>
            </div>
            <div className="col-md-6 dato-item">
              <span className="dato-label">Prioridad</span>
              <span className="dato-valor">{expediente.prioridad ?? "-"}</span>
            </div>

            <div className="col-md-6 dato-item">
              <span className="dato-label">Presentante</span>
              <span className="dato-valor">{expediente.usuario_presentante_nombre ? `${expediente.usuario_presentante_nombre} ${expediente.usuario_presentante_apellido ?? ""}` : "-"}</span>
            </div>
            <div className="col-md-6 dato-item">
              <span className="dato-label">Fecha de Creación</span>
              <span className="dato-valor">{formatFecha(expediente.fecha_creacion)}</span>
            </div>

            <div className="col-md-6 dato-item">
              <span className="dato-label">Teléfono de contacto</span>
              <span className="dato-valor">{expediente.usuario_presentante_telefono ?? "Sin datos"}</span>
            </div>
            <div className="col-md-6 dato-item">
              <span className="dato-label">Asignado a</span>
              <span className="dato-valor">{expediente.usuario_asignado_nombre ? renderAsignado(expediente) : "Sin asignar"}</span>
            </div>

            <div className="col-12 dato-item dato-item-full">
              <span className="dato-label">Descripción</span>
              <p className="mb-0 dato-valor">{expediente.descripcion ?? "-"}</p>
            </div>
          </div>
        </div>

        {/* Documentos */}
        <span className="modal-seccion-header">Documentación del Expediente</span>
        {loading ? (
          <div className="text-center py-2"><Spinner size="sm" /> Cargando…</div>
        ) : (
          (() => {
            const categories = [
              { id: "0", label: "DNI del presentante (frente y dorso)", key: "dni" },
              { id: "1", label: "Nota de elevación (con firma y aclaración)", key: "nota" },
              { id: "2", label: "Plano de ubicación de proyecto", key: "plano" },
              { id: "3", label: "Memoria descriptiva", key: "memoria" },
              { id: "4", label: "Título de propiedad o boleto de compra venta", key: "titulo" }
            ];

            return (
              <>
                {/* SECCIÓN: PRESENTANTE */}
                <div className="seccion-titulo-premium">
                  <i className="bi bi-person-fill"></i>
                  <h6>Presentante</h6>
                </div>

                <Accordion className="accordion-maestro shadow-sm rounded mb-4">
                  <Accordion.Item eventKey="presentante-master">
                    <Accordion.Header>
                      <span className="fw-medium">Documentación</span>
                    </Accordion.Header>
                    <Accordion.Body className="p-0 border-0">
                      <Accordion defaultActiveKey={null} className="accordion-documentos-internos">
                        {categories.map((cat) => {
                          const archivosAMostrar = documentos.filter(doc => {
                            if (doc.categoria) return doc.categoria === cat.key;
                            const nombre = doc.nombre_archivo.toLowerCase();
                            if (cat.key === 'dni' && (nombre.includes('dni') || nombre.includes('frente') || nombre.includes('dorso'))) return true;
                            if (cat.key === 'nota' && (nombre.includes('nota') || nombre.includes('elevacion'))) return true;
                            if (cat.key === 'plano' && (nombre.includes('plano') || nombre.includes('ubicacion'))) return true;
                            if (cat.key === 'memoria' && nombre.includes('memoria')) return true;
                            if (cat.key === 'titulo' && (nombre.includes('titulo') || nombre.includes('propiedad') || nombre.includes('boleto'))) return true;
                            return false;
                          });

                          return (
                            <Accordion.Item eventKey={cat.id} key={cat.id}>
                              <Accordion.Header>
                                <div className="d-flex justify-content-between w-100 me-3">
                                  <span>{cat.label}</span>
                                  <Badge bg={archivosAMostrar.length > 0 ? "primary" : "secondary"} pill className="badge-archivos-count">
                                    {archivosAMostrar.length} {archivosAMostrar.length === 1 ? 'archivo' : 'archivos'}
                                  </Badge>
                                </div>
                              </Accordion.Header>
                              <Accordion.Body className="bg-light p-2">
                                  <div className="listado-archivos-categoria">
                                    {archivosAMostrar.length === 0 ? (
                                      <p className="text-muted small mb-0 p-2">No hay archivos en esta categoría.</p>
                                    ) : (
                                      archivosAMostrar.map((doc) => (
                                        <div key={doc.id_documento} className="doc-subido-item-nuevo mb-2 p-2 border rounded d-flex justify-content-between align-items-center shadow-sm bg-white">
                                          <div className="d-flex align-items-center overflow-hidden">
                                            <i className="bi bi-file-earmark-pdf text-danger me-2 fs-5"></i>
                                            <div className="text-truncate">
                                              <p className="mb-0 fw-medium text-truncate doc-nombre">{doc.nombre_archivo}</p>
                                              <small className="doc-meta">
                                                Subido el {new Date(doc.fecha_subida).toLocaleDateString()} — {doc.subido_por_nombre || 'Presentante'}
                                              </small>
                                            </div>
                                          </div>
                                          <div className="d-flex gap-2">
                                            <Button 
                                              size="sm" 
                                              variant="outline-primary"
                                              className="d-flex align-items-center gap-1 py-1 px-2"
                                              style={{ fontSize: '0.75rem' }}
                                              onClick={() => window.open(`${API_DOCS}/ver/${doc.id_documento}`, "_blank")}
                                            >
                                              <i className="bi bi-eye"></i> Ver
                                            </Button>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </Accordion.Body>
                            </Accordion.Item>
                          );
                        })}
                      </Accordion>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>

                {/* --- SECCIONES EXTRA SEGÚN ROL (Informes de Pases) --- */}
                {(() => {
                  const categoriasPresentante = ["dni", "nota", "plano", "memoria", "titulo"];
                  
                  // 1. Otros documentos del presentante (sin categoría específica)
                  const docsPresentanteOtros = documentos.filter(f => {
                    const rol = (f.rol_nombre || "").toLowerCase();
                    const cat = (f.categoria || "").toLowerCase();
                    const esPresentante = !rol || rol === "" || rol.includes("presentante");
                    return esPresentante && !categoriasPresentante.includes(cat);
                  });

                  // 2. Documentos de Administración
                  const docsAdmin = documentos.filter(f => (f.rol_nombre || "").toLowerCase().includes("admin"));

                  // 3. Documentos de Área Técnica
                  const docsTecnico = documentos.filter(f => (f.rol_nombre || "").toLowerCase().includes("tecnico") || (f.rol_nombre || "").toLowerCase().includes("técnico"));

                  // 4. Documentos de Área Jurídica
                  const docsJuridico = documentos.filter(f => (f.rol_nombre || "").toLowerCase().includes("juridico") || (f.rol_nombre || "").toLowerCase().includes("jurídico"));

                  const renderSeccionDoc = (titulo, icon, colorClass, archivos) => {
                    if (archivos.length === 0) return null;
                    return (
                      <div className="mt-4 pt-3 border-top">
                        <h6 className={`mb-3 fw-bold ${colorClass}`}>
                          <i className={`bi ${icon} me-2`}></i>{titulo}:
                        </h6>
                        <div className="listado-archivos-categoria">
                          {archivos.map((f, i) => (
                            <div key={i} className="doc-subido-item-nuevo mb-2 p-2 border rounded bg-white shadow-sm d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center overflow-hidden">
                                <i className={`bi bi-file-earmark-pdf ${colorClass} me-2`}></i>
                                <div>
                                  <div className="doc-nombre fw-semibold text-truncate" style={{ fontSize: '0.9rem' }}>{f.nombre_archivo}</div>
                                  <div className="doc-meta text-muted" style={{ fontSize: '0.75rem' }}>
                                    Subido el {f.fecha_subida ? new Date(f.fecha_subida).toLocaleDateString('es-AR') : '—'} 
                                    {f.subido_por_nombre ? ` por ${f.subido_por_nombre}` : ''}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="link"
                                size="sm"
                                className="text-decoration-none"
                                onClick={() => window.open(`${API_DOCS}/ver/${f.id_documento}`, "_blank")}
                              >
                                <i className="bi bi-eye me-1"></i>Ver
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  };

                  return null;
                })()}
              </>
            );
          })()
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
    // Por defecto, filtrar las últimas dos semanas
    const hoy = new Date();
    const haceDosSemanas = new Date();
    haceDosSemanas.setDate(hoy.getDate() - 14);
    const desdeStr = haceDosSemanas.toISOString().split('T')[0];
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

  const handlePaseExitoso = (id_expediente) => {
    setExpedientes((prev) => prev.filter((e) => e.id_expediente !== id_expediente));
    setPasesPorExp((prev) => {
      const next = { ...prev };
      delete next[id_expediente];
      return next;
    });
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
                  className={`btn-date-filter ${fechaDesde || fechaHasta ? 'active' : ''}`}
                style={{
                  background: (fechaDesde || fechaHasta) ? "#eaf2ff" : "rgba(255,255,255,0.15)",
                  color: (fechaDesde || fechaHasta) ? "#2563eb" : "#fff",
                  border: "1.5px solid rgba(255,255,255,0.35)",
                  height: "36px",
                }}
                >
                  {(fechaDesde || fechaHasta) ? (fechaDesde && fechaHasta ? "Rango" : "Filtrar por fecha") : "Filtrar por fecha"}
                </button>

                {mostrarPickerFecha && (
                  <div className="datepicker-popover align-left">
                    <div style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", fontSize: "0.78rem", color: "#6b7280", marginBottom: "4px", fontWeight: 600 }}>Fecha de inicio</label>
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
            <Alert variant="info" className="mt-4">
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
