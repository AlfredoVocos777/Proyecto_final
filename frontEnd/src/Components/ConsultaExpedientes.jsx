import { useState, useEffect } from "react";
import jsPDF from "jsPDF";
import autoTable from "jspdf-autotable";
import {
  URL_EXPEDIENTES,
  URL_DOCUMENTOS,
  URL_SUBIR_DOCUMENTO,
  URL_OBSERVACIONES,
} from "../Constants/endpoints";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Modal,
  Form,
  Badge,
  Container,
  Alert,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import "../CSS/Consulta.css";

function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  useEffect(() => {
    axios
      .get("http://localhost:8000/usuarios")
      .then((res) => setUsuarios(res.data || []))
      .catch((err) => console.error("Error cargando usuarios:", err));
  }, []);
  return usuarios;
}

function ConsultaExpedientes() {
  const navigate = useNavigate();
  const usuarios = useUsuarios();

  // --- Estados Generales ---
  const [expedientes, setExpedientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Estados Paginación ---
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 10;

  // --- Estados Modal Detalles/Documentos (rama_alfredo) ---
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [expedienteSeleccionado, setExpedienteSeleccionado] = useState(null);
  const [modalFiles, setModalFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [modalUploadedFiles, setModalUploadedFiles] = useState([]);
  const [modalType, setModalType] = useState("ver"); // "ver" o "editar"

  // --- Estados Observaciones (rama_alfredo) ---
  const [observacionesAdmin, setObservacionesAdmin] = useState([]);
  const [observacionesTecnico, setObservacionesTecnico] = useState([]);
  const [observacionesJuridico, setObservacionesJuridico] = useState([]);
  const [observacionesDirector, setObservacionesDirector] = useState([]);

  // --- Estados Modal Pase (HEAD) ---
  const [showPaseModal, setShowPaseModal] = useState(false);
  const [documentosModal, setDocumentosModal] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState("");
  const [observacionPase, setObservacionPase] = useState("");
  const [paseLoading, setPaseLoading] = useState(false);
  const [paseMsg, setPaseMsg] = useState("");

  const usuarioLog = JSON.parse(localStorage.getItem("usuarioLogueado")) || {
    id_usuario: 1,
    nombre: "Admin",
    apellido: "Demo",
  };

  const tecnicos = usuarios.filter(
    (u) => u.id_rol === 28 || (u.rol && u.rol.toLowerCase() === "técnico")
  );

  useEffect(() => {
    obtenerExpedientes();
  }, []);

  const obtenerExpedientes = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/expedientes");
      setExpedientes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al obtener expedientes:", err);
      setError("No se pudieron cargar los expedientes.");
      setExpedientes([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica de Archivos y Documentos ---
  const handleModalFileSelect = (e) => {
    if (!e.target.files) return;
    const archivos = Array.from(e.target.files);
    setSelectedFiles(archivos);
    setModalFiles(archivos);
  };

  const subirArchivosModal = async () => {
    if (!selectedFiles.length) return;
    const idUsuario = usuarioLog?.id_usuario;
    const resultados = await uploadModalFiles(
      expedienteSeleccionado.id_expediente,
      selectedFiles,
      idUsuario
    );

    if (resultados && resultados.length) {
      const archivosMapeados = resultados.map((r) => ({
        id_documento: r.id_documento,
        nombre: r.nombre,
      }));
      setModalUploadedFiles((prev) => [...prev, ...archivosMapeados]);
      setSelectedFiles([]);
      setModalFiles([]);
      if (document.getElementById("modalFileUpload")) {
        document.getElementById("modalFileUpload").value = "";
      }
      alert("Archivos subidos con éxito ✅");
    }
  };

  const uploadModalFiles = async (expedienteId, archivos, idUsuario) => {
    const formData = new FormData();
    formData.append("id_expediente", expedienteId);
    formData.append("subido_por", idUsuario);
    archivos.forEach((file) => formData.append("files", file));

    try {
      const response = await axios.post(
        `${URL_DOCUMENTOS}/subirYRegistrar`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data.resultados;
    } catch (error) {
      console.error("Error al subir archivos:", error);
      alert("No se pudieron subir los archivos.");
    }
  };

  // --- Lógica de Observaciones ---
  const cargarObservaciones = async (idExpediente) => {
    try {
      const res = await axios.get(`http://localhost:8000/observaciones/${idExpediente}`);
      const data = res.data;
      setObservacionesAdmin(data.Administrativo || []);
      setObservacionesTecnico(data.Técnico || []);
      setObservacionesJuridico(data.Jurídico || []);
      setObservacionesDirector(data.Director || []);
    } catch (error) {
      console.error("Error al cargar observaciones", error);
    }
  };

  // --- Lógica de Pase ---
  const handleAbrirPase = async (expediente) => {
    setExpedienteSeleccionado(expediente);
    setShowPaseModal(true);
    setLoadingDocs(true);
    setPaseMsg("");
    try {
      const res = await axios.get(
        `http://localhost:8000/api/documentos/expediente/${expediente.id_expediente}`
      );
      setDocumentosModal(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setDocumentosModal([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handlePase = async () => {
    if (!tecnicoSeleccionado || !expedienteSeleccionado || !observacionPase) {
      setPaseMsg("Seleccione un técnico y complete la observación.");
      return;
    }
    const confirmado = window.confirm("¿Confirmar el pase al técnico?");
    if (!confirmado) return;

    setPaseLoading(true);
    try {
      await axios.post("http://localhost:8000/historial", {
        id_expediente: expedienteSeleccionado.id_expediente,
        id_usuario_responsable: tecnicoSeleccionado,
        comentario: observacionPase,
        tipo_accion: "asignación",
      });
      await axios.post("http://localhost:8000/observaciones", {
        id_expediente: expedienteSeleccionado.id_expediente,
        id_usuario: usuarioLog?.id_usuario || 1,
        observacion: observacionPase,
      });
      await axios.put(`http://localhost:8000/expedientes/${expedienteSeleccionado.id_expediente}`, {
        id_profesional_asignado: tecnicoSeleccionado,
      });

      // Notificación
      const presentante = usuarios.find(u => u.id_usuario === expedienteSeleccionado.id_usuario_presentante);
      const tecnicoObj = usuarios.find(u => u.id_usuario == tecnicoSeleccionado);
      await axios.post("http://localhost:8000/api/notificar-pase", {
        id_usuario: presentante?.id_usuario,
        email: presentante?.email || "",
        nombre: presentante?.nombre || "",
        apellido: presentante?.apellido || "",
        numero_expediente: expedienteSeleccionado.numero_expediente,
        observacion: observacionPase,
        tecnico_nombre: tecnicoObj?.nombre || "",
        tecnico_apellido: tecnicoObj?.apellido || "",
      });

      alert("Pase realizado correctamente.");
      setShowPaseModal(false);
      setTecnicoSeleccionado("");
      setObservacionPase("");
      obtenerExpedientes();
    } catch (err) {
      console.error("Error en el pase:", err);
      setPaseMsg("Error al realizar el pase.");
    } finally {
      setPaseLoading(false);
    }
  };

  // --- Lógica de Detalles ---
  const handleAbrirDetalles = (expediente) => {
    setExpedienteSeleccionado(expediente);
    setModalType("ver");
    setShowDetailsModal(true);
    cargarObservaciones(expediente.id_expediente);
    // Cargar documentos relacionados
    axios.get(`http://localhost:8000/api/documentos/expediente/${expediente.id_expediente}`)
      .then(res => setModalUploadedFiles(Array.isArray(res.data) ? res.data : []))
      .catch(() => setModalUploadedFiles([]));
  };

  const archivarExpediente = async (id) => {
    if (window.confirm("¿Seguro desea archivar este expediente?")) {
      try {
        await axios.put(`http://localhost:8000/expedientes/archivar/${id}`);
        alert("Archivado correctamente.");
        obtenerExpedientes();
      } catch (err) {
        alert("Error al archivar.");
      }
    }
  };

  // --- Filtrado y Paginación ---
  const expedientesFiltrados = expedientes.filter((exp) => {
    const matchesBusqueda =
      (exp.numero_expediente?.toString().toLowerCase() || "").includes(busqueda.toLowerCase()) ||
      (exp.tipo_expediente?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
      (exp.descripcion?.toLowerCase() || "").includes(busqueda.toLowerCase());
    
    const matchesTipo = filtroTipo === "" || exp.tipo_expediente === filtroTipo;

    // Si es presentante, solo ver los suyos
    if (usuarioLog?.tipo_usuario?.toLowerCase() === "presentante") {
      return exp.id_usuario_presentante === usuarioLog.id_usuario && matchesBusqueda && matchesTipo;
    }
    
    return matchesBusqueda && matchesTipo;
  });

  const total = expedientesFiltrados.length;
  const inicio = (paginaActual - 1) * porPagina;
  const fin = inicio + porPagina;
  const pagina = expedientesFiltrados.slice(inicio, fin);

  const getEstadoBadge = (estado) => {
    const e = estado?.toLowerCase();
    if (e === "aprobado") return "success";
    if (e === "rechazado") return "danger";
    if (e === "archivado") return "secondary";
    return "warning";
  };

  const formatearFecha = (fecha) => {
    return fecha ? new Date(fecha).toLocaleDateString("es-AR") : "N/A";
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Expedientes", 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [["N° Expediente", "Tipo", "Estado", "Fecha"]],
      body: expedientesFiltrados.map((e) => [
        e.numero_expediente,
        e.tipo_expediente,
        e.estado_actual,
        formatearFecha(e.fecha_creacion),
      ]),
    });
    doc.save("expedientes.pdf");
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Consulta de Expedientes</h2>
        <Button variant="outline-primary" onClick={() => navigate(-1)}>Volver</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="row g-2 mb-4">
        <div className="col-md-6">
          <Form.Control
           placeholder="Buscar por número, tipo o descripción..."
           value={busqueda}
           onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
          />
        </div>
        <div className="col-md-4">
          <Form.Select value={filtroTipo} onChange={(e) => { setFiltroTipo(e.target.value); setPaginaActual(1); }}>
            <option value="">Todos los tipos</option>
            {[...new Set(expedientes.map(e => e.tipo_expediente))].filter(Boolean).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Form.Select>
        </div>
        <div className="col-md-2 d-grid">
          <Button variant="success" onClick={exportarPDF}>Reporte PDF</Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>N° Expediente</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagina.length > 0 ? (
                pagina.map((exp) => {
                   const presentante = usuarios.find(u => u.id_usuario === exp.id_usuario_presentante);
                   return (
                  <tr key={exp.id_expediente}>
                    <td><strong>{exp.numero_expediente}</strong></td>
                    <td>{exp.tipo_expediente}</td>
                    <td><Badge bg={getEstadoBadge(exp.estado_actual)}>{exp.estado_actual}</Badge></td>
                    <td>{formatearFecha(exp.fecha_creacion)}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button variant="primary" size="sm" onClick={() => handleAbrirDetalles(exp)}>Ver Detalles</Button>
                        {usuarioLog?.id_rol !== 28 && ( // Si no es técnico, puede realizar pase
                           <Button variant="info" size="sm" onClick={() => handleAbrirPase(exp)}>Pase</Button>
                        )}
                        <Button variant="outline-secondary" size="sm" onClick={() => archivarExpediente(exp.id_expediente)}>Archivar</Button>
                      </div>
                    </td>
                  </tr>
                )})
              ) : (
                <tr><td colSpan="5" className="text-center">No se encontraron expedientes.</td></tr>
              )}
            </tbody>
          </Table>

          {total > porPagina && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">Mostrando {inicio + 1} a {Math.min(fin, total)} de {total}</small>
              <div>
                <Button variant="outline-secondary" size="sm" className="me-2" disabled={paginaActual === 1} onClick={() => setPaginaActual(p => p - 1)}>Anterior</Button>
                <Button variant="outline-secondary" size="sm" disabled={fin >= total} onClick={() => setPaginaActual(p => p + 1)}>Siguiente</Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Pase */}
      <Modal show={showPaseModal} onHide={() => setShowPaseModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Realizar Pase de Expediente #{expedienteSeleccionado?.numero_expediente}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDocs ? <div className="text-center"><Spinner animation="border" /></div> : (
             <>
               <h6>Documentos Adjuntos:</h6>
               <ul className="mb-4">
                 {documentosModal.length > 0 ? documentosModal.map(doc => (
                   <li key={doc.id_documento}>
                     {doc.nombre_archivo} 
                     <Button variant="link" size="sm" onClick={() => window.open(`http://localhost:8000/uploads/${doc.nombre_archivo}`, "_blank")}>Ver</Button>
                   </li>
                 )) : <li>Sin documentos</li>}
               </ul>
               <Form.Group className="mb-3">
                 <Form.Label>Técnico a Asignar</Form.Label>
                 <Form.Select value={tecnicoSeleccionado} onChange={(e) => setTecnicoSeleccionado(e.target.value)}>
                   <option value="">Seleccione un técnico...</option>
                   {tecnicos.map(t => <option key={t.id_usuario} value={t.id_usuario}>{t.nombre} {t.apellido}</option>)}
                 </Form.Select>
               </Form.Group>
               <Form.Group className="mb-3">
                 <Form.Label>Observación para el Pase</Form.Label>
                 <Form.Control as="textarea" rows={3} value={observacionPase} onChange={(e) => setObservacionPase(e.target.value)} />
               </Form.Group>
               {paseMsg && <Alert variant={paseMsg.includes("Error") ? "danger" : "info"}>{paseMsg}</Alert>}
             </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaseModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handlePase} disabled={paseLoading}>{paseLoading ? "Procesando..." : "Confirmar Pase"}</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Detalles */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalles: Expediente #{expedienteSeleccionado?.numero_expediente}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {expedienteSeleccionado && (
            <div className="details-container">
               <div className="mb-3">
                 <p><strong>Tipo:</strong> {expedienteSeleccionado.tipo_expediente}</p>
                 <p><strong>Descripción:</strong> {expedienteSeleccionado.descripcion}</p>
                 <p><strong>Estado Actual:</strong> <Badge bg={getEstadoBadge(expedienteSeleccionado.estado_actual)}>{expedienteSeleccionado.estado_actual}</Badge></p>
               </div>
               
               <hr />
               <h5>Historial de Observaciones</h5>
               <div className="row">
                 <div className="col-md-6 mb-3">
                   <h6>Administrativo</h6>
                   <div className="obs-box border p-2 bg-light rounded" style={{maxHeight:150, overflowY:'auto'}}>
                     {observacionesAdmin.length ? observacionesAdmin.map((o,i) => <p key={i} className="small mb-1">• {o.observacion}</p>) : <p className="text-muted small">Sin obs.</p>}
                   </div>
                 </div>
                 <div className="col-md-6 mb-3">
                   <h6>Técnico</h6>
                   <div className="obs-box border p-2 bg-light rounded" style={{maxHeight:150, overflowY:'auto'}}>
                     {observacionesTecnico.length ? observacionesTecnico.map((o,i) => <p key={i} className="small mb-1">• {o.observacion}</p>) : <p className="text-muted small">Sin obs.</p>}
                   </div>
                 </div>
               </div>

               <hr />
               <h5>Documentos</h5>
               <div className="mb-3">
                 <Form.Group controlId="modalFileUpload" className="mb-2">
                   <Form.Label className="small">Subir más archivos:</Form.Label>
                   <Form.Control type="file" multiple onChange={handleModalFileSelect} />
                 </Form.Group>
                 {modalFiles.length > 0 && <Button variant="primary" size="sm" onClick={subirArchivosModal}>Subir Seleccionados</Button>}
               </div>
               <ul className="list-unstyled">
                 {modalUploadedFiles.map(f => (
                   <li key={f.id_documento} className="border-bottom py-2 d-flex justify-content-between align-items-center">
                     <span>✓ {f.nombre || f.nombre_archivo}</span>
                     <Button variant="outline-primary" size="sm" onClick={() => window.open(`http://localhost:8000/uploads/${f.nombre_archivo || f.nombre}`, "_blank")}>Ver</Button>
                   </li>
                 ))}
               </ul>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ConsultaExpedientes;
