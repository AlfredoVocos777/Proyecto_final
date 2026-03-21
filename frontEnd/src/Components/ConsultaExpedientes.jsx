import { useState, useEffect } from "react";
import jsPDF from "jspdf";
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
} from "react-bootstrap";
import axios from "axios";
import "../CSS/Consulta.css";

function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  useEffect(() => {
    axios.get("http://localhost:8000/usuarios").then(res => setUsuarios(res.data || []));
  }, []);
  return usuarios;
}

function ConsultaExpedientes(props) {
    // Inicializar usuarios
    const usuarios = useUsuarios();
    // Filtrar usuarios técnicos
    const tecnicos = usuarios.filter(u => u.id_rol === 28 || (u.rol && u.rol.toLowerCase() === "técnico"));
    // Obtener usuario logueado desde localStorage (o simulado)
    let usuarioLogueado = null;
    try {
      usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));
    } catch {}
    if (!usuarioLogueado) {
      // Simulación si no existe en localStorage
      usuarioLogueado = { id_usuario: 1, nombre: "Admin", apellido: "Demo" };
    }
<<<<<<< HEAD
    // Estados para el modal de documentos
    const [busqueda, setBusqueda] = useState("");
    const [expedientes, setExpedientes] = useState([]);
    // Cargar expedientes desde el backend al montar el componente
    useEffect(() => {
      obtenerExpedientes();
    }, []);
    // Función para recargar expedientes
    const obtenerExpedientes = async () => {
=======
  };

  // Estado para guardar los archivos seleccionados en el modal
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Función para capturar los archivos cuando el usuario los selecciona

  const handleModalFileSelect = (e) => {
    if (!e.target.files) return;
    const archivos = Array.from(e.target.files);
    setSelectedFiles(archivos);
    setModalFiles(archivos); // para mostrar en el recuadro de selección
  };

  // Función para subir archivos desde el modal
  const subirArchivosModal = async () => {
    if (!selectedFiles.length) return;

    const idUsuario = usuarioLog?.id_usuario;
    const archivos = selectedFiles;

    const resultados = await uploadModalFiles(
      expedienteSeleccionado.id_expediente,
      archivos,
      idUsuario
    );

    if (resultados && resultados.length) {
      // Mapear los resultados para que tengan la propiedad 'nombre' usada en el JSX
      const archivosMapeados = resultados.map((r) => ({
        id_documento: r.id_documento,
        nombre: r.nombre,
      }));

      // Agregar al listado de documentos subidos
      setModalUploadedFiles((prev) => [...prev, ...archivosMapeados]);

      // Limpiar input y selección
      setSelectedFiles([]);
      setModalFiles([]);
      document.getElementById("modalFileUpload").value = ""; // limpia input

      alert("Archivos subidos con éxito ✅");
    }
  };

  // Función para enviar los archivos al backend
  const uploadModalFiles = async (
    expedienteId,
    archivosSeleccionados,
    idUsuario
  ) => {
    if (!archivosSeleccionados || !archivosSeleccionados.length) return;

    const formData = new FormData();
    formData.append("id_expediente", expedienteId);
    formData.append("subido_por", idUsuario);

    archivosSeleccionados.forEach((file) => {
      formData.append("files", file); // 'files' coincide con Multer
    });

    try {
      const response = await axios.post(
        `${URL_DOCUMENTOS}/subirYRegistrar`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Archivos subidos y registrados en BD:", response.data);
      return response.data.resultados; // [{id_documento, nombre}, ...]
    } catch (error) {
      console.error("Error al subir archivos:", error);
      alert("No se pudieron subir los archivos. Revisá la consola.");
    }
  };

  // funcion para cargar las observaciones desde el admin

  const cargarObservaciones = async (idExpediente) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/observaciones/${idExpediente}`
      );
      const data = res.data;

      // Admin
      setObservacionesAdmin(data.Administrativo || [])

      // Técnico
      setObservacionesTecnico(data.Técnico || []);

      // Jurídico
      setObservacionesJuridico(data.Jurídico || []);

      // Director
      setObservacionesDirector(data.Director || []);
    } catch (error) {
      console.error("Error al cargar observaciones", error);
    }
  };

  //------------------------------------------------------------------------
  // Función para actualizar expediente
  const actualizarExpediente = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${URL_EXPEDIENTES}/${expedienteSeleccionado.id_expediente}`,
        formData
      );
      alert("Expediente actualizado exitosamente");
      cerrarModal();
      obtenerExpedientes(); // Recargar la lista
    } catch (error) {
      console.error("Error al actualizar expediente:", error);
      alert("Error al actualizar el expediente");
    }
  };

  //-------------------------------------------------------------------
  // Función para archivar expediente
  const archivarExpediente = async (id) => {
    if (window.confirm("¿Está seguro que desea archivar este expediente?")) {
>>>>>>> origin/rama_alfredo
      try {
        const res = await axios.get("http://localhost:8000/expedientes");
        setExpedientes(Array.isArray(res.data) ? res.data : []);
      } catch {
        setExpedientes([]);
      }
    };
    // Filtrado de expedientes: solo los asignados al usuario logueado y según búsqueda
    const expedientesFiltrados = expedientes.filter(exp => {
      // Mostrar solo expedientes asignados al usuario logueado
      if (exp.id_profesional_asignado !== usuarioLogueado.id_usuario) return false;
      if (!busqueda.trim()) return true;
      return (
        (exp.numero_expediente && exp.numero_expediente.toString().toLowerCase().includes(busqueda.toLowerCase())) ||
        (exp.tipo_expediente && exp.tipo_expediente.toLowerCase().includes(busqueda.toLowerCase())) ||
        (exp.presentante && exp.presentante.toLowerCase().includes(busqueda.toLowerCase()))
      );
    });

    // Exportar tabla a PDF
    const exportarPDF = () => {
      const doc = new jsPDF();
      doc.text("Reporte de Expedientes", 14, 14);
      autoTable(doc, {
        startY: 20,
        head: [["N° Expediente", "Tipo", "Presentante", "Fecha Creación"]],
        body: expedientesFiltrados.map(expediente => [
          expediente.numero_expediente,
          expediente.tipo_expediente,
          (usuarios.find(u => u.id_usuario === expediente.id_usuario_presentante) ? `${usuarios.find(u => u.id_usuario === expediente.id_usuario_presentante).nombre} ${usuarios.find(u => u.id_usuario === expediente.id_usuario_presentante).apellido}` : expediente.id_usuario_presentante),
          expediente.fecha_creacion
        ]),
      });
      doc.save("expedientes.pdf");
    };
    // Inicializar usuarios primero
    // ...existing code... (eliminado duplicado de usuarios)
    // Estados para el modal de documentos
    const [showModal, setShowModal] = useState(false);
    const [expedienteModal, setExpedienteModal] = useState(null);
    const [documentosModal, setDocumentosModal] = useState([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState("");
    const [observacion, setObservacion] = useState("");
    const [paseLoading, setPaseLoading] = useState(false);
    const [paseMsg, setPaseMsg] = useState("");
    // Filtrar usuarios técnicos
    // ...existing code... (eliminado duplicado de tecnicos)
    // Obtener usuario logueado (simulado desde localStorage)
    // ...existing code... (eliminado duplicado de usuarioLogueado)

    // Función para abrir el modal y cargar documentos
    const handleVerDocumentos = async (expediente) => {
      setExpedienteModal(expediente);
      setShowModal(true);
      setLoadingDocs(true);
      try {
        const res = await axios.get(`http://localhost:8000/api/documentos/expediente/${expediente.id_expediente}`);
        console.log('Documentos recibidos del backend:', res.data);
        setDocumentosModal(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setDocumentosModal([]);
      } finally {
        setLoadingDocs(false);
      }
    };

    // Función para realizar el pase
    const handlePase = async () => {
        console.log('handlePase ejecutado', { tecnicoSeleccionado, expedienteModal, observacion });
      if (!tecnicoSeleccionado || !expedienteModal) {
        setPaseMsg("Seleccione un técnico y complete la observación.");
        return;
      }
      // Confirmación antes de realizar el pase
      const confirmado = window.confirm("¿Está seguro que desea realizar el pase de este expediente al técnico seleccionado?");
      if (!confirmado) return;
      setPaseLoading(true);
      setPaseMsg("");
      try {
        // 1. Guardar en historial_expediente
        await axios.post("http://localhost:8000/historial", {
          id_expediente: expedienteModal.id_expediente,
          id_usuario_responsable: tecnicoSeleccionado,
          comentario: observacion,
          tipo_accion: "asignación"
        });
        // 2. Guardar en observaciones
        await axios.post("http://localhost:8000/observaciones", {
          id_expediente: expedienteModal.id_expediente,
          id_usuario: usuarioLogueado?.id_usuario || 1,
          observacion
        });
        // 3. Actualizar el expediente con el nuevo técnico asignado
        await axios.put(`http://localhost:8000/expedientes/${expedienteModal.id_expediente}`, {
          id_profesional_asignado: tecnicoSeleccionado
        });
        // 4. Notificar al presentante
        let mailMsg = "";
        if (expedienteModal.id_usuario_presentante) {
          // Buscar datos del presentante y del técnico asignado
          const presentante = usuarios.find(u => u.id_usuario === expedienteModal.id_usuario_presentante);
          const tecnico = usuarios.find(u => u.id_usuario == tecnicoSeleccionado);
          const resp = await axios.post("http://localhost:8000/api/notificar-pase", {
            id_usuario: presentante?.id_usuario,
            email: presentante?.email || "",
            nombre: presentante?.nombre || "",
            apellido: presentante?.apellido || "",
            numero_expediente: expedienteModal.numero_expediente,
            observacion,
            tecnico_nombre: tecnico ? tecnico.nombre : "",
            tecnico_apellido: tecnico ? tecnico.apellido : ""
          });
          if (resp.data && resp.data.message && resp.data.message.includes("enviada por email")) {
            mailMsg = " Se envió un mail al presentante.";
          }
        }
        setPaseMsg("Pase realizado y observación guardada correctamente." + mailMsg);
        setShowModal(false);
        setTecnicoSeleccionado("");
        setObservacion("");
        await obtenerExpedientes();
      } catch (err) {
        console.log('Error al realizar el pase o guardar la observación:', err);
        setPaseMsg("Error al realizar el pase o guardar la observación.");
      } finally {
        setPaseLoading(false);
      }
    };
    // ...existing code...
  return (
    <Container>
      <h2>Consulta de Expedientes</h2>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>Volver</Button>
        <input
          type="text"
          className="form-control mx-2"
          style={{ maxWidth: 300 }}
          placeholder="Buscar expediente..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <Button variant="success" onClick={exportarPDF}>Generar Reporte</Button>
      </div>
<<<<<<< HEAD
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>N° Expediente</th>
            <th>Tipo</th>
            <th>Presentante</th>
            {/* <th>Documentación</th> */}
            {/* <th>Usuario/Rol actual</th> */}
            <th>Fecha Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {expedientesFiltrados.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center">No hay expedientes para mostrar.</td>
            </tr>
          ) : (
            expedientesFiltrados.map((expediente) => {
              const presentante = usuarios.find(u => u.id_usuario === expediente.id_usuario_presentante);
              return (
=======

      {/* Subtítulo contextual para presentante */}
      {usuarioLog?.tipo_usuario?.toLowerCase() === "presentante" && (
        <p className="text-muted mb-3">Mostrando tus expedientes presentados</p>
      )}

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {expedientes.length === 0 ? (
        <Alert variant="info">
          No hay expedientes registrados en el sistema.
        </Alert>
      ) : (
        <div className="tabla-container">
          {/* Barra de filtros */}
          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por número, tipo o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="">Tipo (todos)</option>
                {Array.from(
                  new Set(
                    expedientes.map((e) => e.tipo_expediente).filter(Boolean)
                  )
                ).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2 d-grid">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setBusqueda("");
                  setFiltroTipo("");
                }}
              >
                Limpiar
              </Button>
            </div>
          </div>

          {/* Info de paginación superior */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="text-muted">
              Mostrando {Math.min(inicio + 1, total)} a {Math.min(fin, total)}{" "}
              de {total}
            </small>
            <div>
              <Button
                variant="outline-secondary"
                size="sm"
                className="me-2"
                onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() =>
                  setPaginaActual((p) => (p * porPagina < total ? p + 1 : p))
                }
                disabled={paginaActual * porPagina >= total}
              >
                Siguiente
              </Button>
            </div>
          </div>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th style={{ width: "180px" }}>N° Expediente</th>
                <th style={{ width: "120px" }}>Tipo</th>
                <th style={{ width: "350px" }}>Descripción</th>
                <th style={{ width: "120px" }}>Estado</th>
                <th style={{ width: "160px" }}>Fecha Creación</th>
                <th style={{ width: "220px" }}>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {pagina.map((expediente) => (
>>>>>>> 482707a45fbc07eefe5f6ab58c8a29e222971331
                <tr key={expediente.id_expediente}>
                  <td>{expediente.numero_expediente}</td>
                  <td>{expediente.tipo_expediente}</td>
                  <td>{presentante ? `${presentante.nombre} ${presentante.apellido}` : expediente.id_usuario_presentante}</td>
                  <td>{expediente.fecha_creacion}</td>
                  <td>
<<<<<<< HEAD
                    <Button variant="primary" size="sm" onClick={() => handleVerDocumentos(expediente)}>
                      Realizar Pase
                    </Button>
                  </td>
=======
                    <Badge bg={getEstadoBadge(expediente.estado_actual)}>
                      {expediente.estado_actual || "N/A"}
                    </Badge>
                  </td>
                  <td>{formatearFecha(expediente.fecha_creacion)}</td>
                  <td>{expediente.observaciones || "Sin observaciones"}</td>
>>>>>>> 482707a45fbc07eefe5f6ab58c8a29e222971331
                </tr>
<<<<<<< HEAD
              );
            })
=======
              ))}
            </tbody>
          </Table>

          {/* Controles inferiores de paginación */}
          <div className="d-flex justify-content-between align-items-center mt-2">
            <small className="text-muted">
              Página {paginaActual} de{" "}
              {Math.max(1, Math.ceil(total / porPagina))}
            </small>
            <div>
              <Button
                variant="outline-secondary"
                size="sm"
                className="me-2"
                onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() =>
                  setPaginaActual((p) => (p * porPagina < total ? p + 1 : p))
                }
                disabled={paginaActual * porPagina >= total}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Ver/Editar */}
      <Modal
        show={showModal}
        onHide={cerrarModal}
        size="lg"
        className="modal-ver"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "ver"
              ? "Detalles del Expediente"
              : "Editar Expediente"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {expedienteSeleccionado && (
            <Form onSubmit={actualizarExpediente}>


              {/*------Datos generales del expediente---------- */}

              <div className="datos-grid">
                <Form.Group>
                  <Form.Label>Expediente</Form.Label>
                  <Form.Label className="expediente-label">
                    {expedienteSeleccionado.numero_expediente}
                  </Form.Label>
                </Form.Group>


                <Form.Group>
                  <Form.Label>Fecha</Form.Label>
                  <Form.Label className="expediente-label">
                    {new Date(expedienteSeleccionado.fecha_creacion).toLocaleString("es-AR")}
                  </Form.Label>
                </Form.Group>

                <Form.Group>
                  <Form.Label>Usuario Presentante</Form.Label>
                  <Form.Label className="expediente-label">
                    {expedienteSeleccionado.id_usuario_presentante}
                  </Form.Label>
                </Form.Group>

                <Form.Group>
                  <Form.Label>Estado</Form.Label>
                  <Form.Label className="expediente-label">
                    {expedienteSeleccionado.estado_actual}
                  </Form.Label>
                </Form.Group>
              </div>

              {/*------Observaciones de los distintos roles---------- */}

              <div className="observaciones-box">
                <h5>Observaciones</h5>
                <div className="observacion-item">
                  <h5>Administrativo</h5>
                  
                  <div className="observaciones-scroll">
                    {observacionesAdmin.length > 0 ? (
                      observacionesAdmin.map((obs, i) => (
                        <Form.Control
                          key={i}
                          as="textarea"
                          rows={3}
                          className="mb-2"
                          disabled
                          value={`• ${obs.observacion}\n(${new Date(obs.fecha_hora).toLocaleString("es-AR")})`}
                        />
                      ))
                    ) : (
                      <Form.Control
                        as="textarea"
                        rows={3}
                        disabled
                        value="Sin observaciones"
                      />
                    )}
                    </div>
                </div>


                <div className="observacion-item">
                  <h5>Técnico</h5>

                  <div className="observaciones-scroll">
                  {observacionesTecnico.length > 0 ? (
                    observacionesTecnico.map((obs, i) => (
                      <Form.Control
                        key={i}
                        as="textarea"
                        rows={3}
                        className="mb-2"
                        disabled
                        value={`• ${obs.observacion}\n(${new Date(obs.fecha_hora).toLocaleString("es-AR")})`}
                      />
                    ))
                  ) : (
                    <Form.Control
                      as="textarea"
                      rows={3}
                      disabled
                      value="Sin observaciones"
                    />
                  )}
                </div>
                </div>


                <div className="observacion-item">
                  <h5>Jurídico</h5>

                  <div className="observaciones-scroll">
                  {observacionesJuridico.length > 0 ? (
                    observacionesJuridico.map((obs, i) => (
                      <Form.Control
                        key={i}
                        as="textarea"
                        rows={3}
                        className="mb-2"
                        disabled
                        value={`• ${obs.observacion}\n(${new Date(obs.fecha_hora).toLocaleString("es-AR")})`}
                      />
                    ))
                  ) : (
                    <Form.Control
                      as="textarea"
                      rows={2}
                      disabled
                      value="Sin observaciones"
                    />
                  )}
                </div>
                </div>


                <div className="observacion-item">
                <h5>Director</h5>
                
                <div className="observaciones-scroll">
                {observacionesDirector.length > 0 ? (
                  observacionesDirector.map((obs, i) => (
                    <Form.Control
                      key={i}
                      as="textarea"
                      rows={2}
                      className="mb-2"
                      disabled
                      value={`${obs.observacion}\n(${new Date(obs.fecha_hora).toLocaleString("es-AR")})`}
                    />
                  ))
                ) : (
                  <Form.Control
                    as="textarea"
                    rows={2}
                    disabled
                    value="Sin observaciones"
                  />
                )}
              </div>
              </div>

              </div>

              {/*Agregar documentos en el modal ver*/}

              <div className="documentos-box">
                {modalType === "ver" && (
                  <>
                    <Form.Group controlId="modalFileUpload" className="mb-3">
                      <Form.Label>Subir más documentos:</Form.Label>
                      <Form.Control
                        type="file"
                        multiple
                        onChange={handleModalFileSelect}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </Form.Group>

                    {modalFiles.length > 0 && (
                      <div className="mb-3">
                        <h6>Archivos seleccionados:</h6>
                        {modalFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="d-flex align-items-center mb-1"
                          >
                            <span className="me-auto">{file.name}</span>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() =>
                                setModalFiles(
                                  modalFiles.filter((f) => f.name !== file.name)
                                )
                              }
                            >
                              Eliminar
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={subirArchivosModal}
                        >
                          Subir Archivos
                        </Button>
                      </div>
                    )}

                    {modalUploadedFiles.map((f, i) => (
                      <li
                        key={i}
                        className="d-flex align-items-center justify-content-between mb-2"
                      >
                        <span>✓ {f.nombre}</span>

                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() =>
                            window.open(`${URL_DOCUMENTOS}/ver/${f.id_documento}`, "_blank", "noopener,noreferrer")
                          }
                        >
                          Ver
                        </Button>
                      </li>
                    ))}

                  </>
                )}
              </div>

              {/* -------------------------------------------------------------------*/}
              {/*  {modalType === "editar" && (
                <div className="d-flex justify-content-end">
                  <Button
                    variant="secondary"
                    onClick={cerrarModal}
                    className="me-2"
                  >
                    Cancelar
                  </Button>
                  <Button variant="primary" type="submit">
                    Guardar Cambios
                  </Button>
                </div>
              )}  */}

              {modalType === "ver" && (
                <div className="d-flex justify-content-end">
                  <Button variant="secondary" onClick={cerrarModal}>
                    Cerrar
                  </Button>
                </div>
              )}
            </Form>
>>>>>>> origin/rama_alfredo
          )}
              {/* Modal global para vista previa de documentos y pase */}
              <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered backdrop="static" className="modal-pase-expediente">
                <Modal.Header closeButton style={{ background: '#f5f7fa', borderBottom: '2px solid #007bff' }}>
                  <Modal.Title style={{ fontWeight: 700, color: '#007bff' }}>
                    <i className="bi bi-folder2-open" style={{marginRight:8}}/> Documentos del Expediente
                    {expedienteModal && expedienteModal.numero_expediente ? ` #${expedienteModal.numero_expediente}` : ''}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ background: '#fafdff' }}>
                  {/* Resumen de datos del expediente */}
                  {expedienteModal && (
                    <div className="mb-4 p-3 rounded" style={{background:'#f0f4fa', border:'1px solid #e3e6f0'}}>
                      <div><strong>N° Expediente:</strong> {expedienteModal.numero_expediente}</div>
                      <div><strong>Tipo:</strong> {expedienteModal.tipo_expediente}</div>
                      <div><strong>Presentante:</strong> {(() => {
                        const presentante = usuarios.find(u => u.id_usuario === expedienteModal.id_usuario_presentante);
                        return presentante ? `${presentante.nombre} ${presentante.apellido}` : expedienteModal.id_usuario_presentante;
                      })()}</div>
                      <div><strong>Fecha de Creación:</strong> {expedienteModal.fecha_creacion}</div>
                    </div>
                  )}
                  {loadingDocs ? (
                    <div className="text-center my-4"><span className="spinner-border text-primary"/> Cargando documentos...</div>
                  ) : documentosModal && documentosModal.length > 0 ? (
                    <div className="d-flex flex-wrap gap-3 mb-4">
                      {documentosModal.map((doc, idx) => {
                        const ext = (doc.nombre_archivo || '').split('.').pop().toLowerCase();
                        const url = `http://localhost:8000/api/documentos/ver/${doc.id_documento}`;
                        if (["jpg","jpeg","png","gif","bmp","webp"].includes(ext)) {
                          return <img key={idx} src={url} alt={doc.nombre_archivo} style={{width:120, height:120, objectFit:'cover', borderRadius:8, border:'2px solid #e3e6f0', boxShadow:'0 2px 8px #e3e6f0'}} title={doc.nombre_archivo} />;
                        }
                        if (["pdf"].includes(ext)) {
                          return (
                            <div key={idx} style={{ width: "100%", marginBottom: 16 }}>
                              <div style={{ marginBottom: 8, color:'#007bff', fontWeight:600 }}>
                                <i className="bi bi-file-earmark-pdf" style={{marginRight:6}}/>{doc.nombre_archivo}
                              </div>
                              <embed
                                src={url}
                                type="application/pdf"
                                width="100%"
                                height="400px"
                                style={{ border: "2px solid #e3e6f0", borderRadius: 8, boxShadow:'0 2px 8px #e3e6f0' }}
                              />
                            </div>
                          );
                        }
                        return <a key={idx} href={url} target="_blank" rel="noopener noreferrer" style={{display:'block', margin:'10px 0', color:'#007bff', fontWeight:500}}><i className="bi bi-file-earmark" style={{fontSize:32, color:'#888', marginRight:6}}/> {doc.nombre_archivo}</a>;
                      })}
                    </div>
                  ) : (
                    <div className="alert alert-info">No hay documentos para este expediente.</div>
                  )}
                  <div className="p-3 rounded shadow-sm" style={{background:'#fff', border:'1px solid #e3e6f0'}}>
                    <h5 className="mb-3" style={{color:'#007bff', fontWeight:600}}><i className="bi bi-arrow-right-circle" style={{marginRight:6}}/> Realizar Pase a Técnico</h5>
                    <Form.Group className="mb-3">
                      <Form.Label>Técnico destino</Form.Label>
                      <Form.Select value={tecnicoSeleccionado} onChange={e => setTecnicoSeleccionado(e.target.value)}>
                        <option value="">Seleccione un técnico</option>
                        {tecnicos.map(t => (
                          <option key={t.id_usuario} value={t.id_usuario}>{t.nombre} {t.apellido}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Observaciones</Form.Label>
                      <Form.Control as="textarea" rows={3} value={observacion} onChange={e => setObservacion(e.target.value)} placeholder="Ingrese observaciones del pase..."/>
                    </Form.Group>
                    {paseMsg && <div className={`mb-2 ${paseMsg.includes('Error') ? 'text-danger' : 'text-success'}`}>{paseMsg}</div>}
                    <div className="d-flex justify-content-end gap-2">
                      <Button variant="secondary" onClick={() => setShowModal(false)} disabled={paseLoading}>Cancelar</Button>
                      <Button variant="primary" onClick={handlePase} disabled={paseLoading || !tecnicoSeleccionado || !observacion.trim()}>
                        {paseLoading ? <span className="spinner-border spinner-border-sm"/> : <i className="bi bi-send" style={{marginRight:6}}/>}
                        Realizar Pase
                      </Button>
                    </div>
                  </div>
                </Modal.Body>
              </Modal>
        </tbody>
      </Table>

      {/* Modal de documentos eliminado */}
    </Container>
  );
}

export default ConsultaExpedientes;
