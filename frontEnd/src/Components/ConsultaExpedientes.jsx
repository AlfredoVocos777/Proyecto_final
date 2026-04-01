import { useState, useEffect } from "react";
import axios from "axios";
import {
  URL_EXPEDIENTES,
  URL_DOCUMENTOS,
  URL_SUBIR_DOCUMENTO,
  URL_OBSERVACIONES,
  URL_HISTORIAL,
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
import "../CSS/Consulta.css";

function ConsultaExpedientes({ soloEstado, rutaVolver = "/Portada" }) {
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "ver", "editar"
  const [expedienteSeleccionado, setExpedienteSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    tipo_expediente: "",
    descripcion: "",
    prioridad: "",
    estado_actual: "",
  });
  const [usuarioLog, setUsuarioLog] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 10;
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState(soloEstado || "");
  const [filtroPrioridad, setFiltroPrioridad] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  // estados de los roles
  const [observacionesAdmin, setObservacionesAdmin] = useState([]);
const [observacionesTecnico, setObservacionesTecnico] = useState([]);
const [observacionesJuridico, setObservacionesJuridico] = useState([]);
const [observacionesDirector, setObservacionesDirector] = useState([]);

  // historial de recepción y pases
  const [historialModal, setHistorialModal] = useState([]);


  // nuevos estados para subir documentos en el modal ver

  const [modalFiles, setModalFiles] = useState([]);
  const [modalUploadedFiles, setModalUploadedFiles] = useState([]);

  const navigate = useNavigate();

  // Obtener expedientes (filtrando por presentante si corresponde)
  const obtenerExpedientes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(URL_EXPEDIENTES);
      const data = response.data || [];
      const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
      if (usuario?.tipo_usuario?.toLowerCase() === "presentante") {
        const uid = Number(usuario.id_usuario);
        const propios = data.filter(
          (e) => Number(e.id_usuario_presentante) === uid
        );
        setExpedientes(propios);
      } else {
        setExpedientes(data);
      }
      setError(null);
      setPaginaActual(1);
    } catch (error) {
      console.error("Error al obtener expedientes:", error);
      setError(
        "Error al cargar los expedientes. Por favor, intente nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("usuarioLogueado"));
    setUsuarioLog(u || null);
    obtenerExpedientes();
  }, []);

  // Resetear a primera página cuando cambian filtros/búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroEstado, filtroPrioridad, filtroTipo]);

  //-------------------------------------------------------------
  //-------------------------------------------------------------
  // Función para abrir el modal
  const abrirModal = async (tipo, expediente) => {
    setModalType(tipo);
    setExpedienteSeleccionado(expediente);

    if (tipo === "editar") {
      setFormData({
        tipo_expediente: expediente.tipo_expediente || "",
        descripcion: expediente.descripcion || "",
        prioridad: expediente.prioridad || "",
        estado_actual: expediente.estado_actual || "",
      });
    }

    if (tipo === "ver") {
      // Primero abrimos el modal vacío
      setShowModal(true);

      // Cargar documentos
      const docs = await obtenerDocumentosExpediente(expediente.id_expediente);
      setModalUploadedFiles(
        docs.map((d) => ({
          id_documento: d.id_documento,
          nombre: d.nombre_archivo,
        }))
      );

      // Cargar observación
      await cargarObservaciones(expediente.id_expediente);

      // Cargar historial (recepción y pases)
      try {
        const resHist = await axios.get(`${URL_HISTORIAL}/${expediente.id_expediente}`);
        setHistorialModal(resHist.data || []);
      } catch (e) {
        setHistorialModal([]);
      }
    } else {
      setShowModal(true);
    }
  };

  //----------------------------------------------------------------------------
  // Función para cerrar el modal
  const cerrarModal = () => {
    setShowModal(false);
    setExpedienteSeleccionado(null);
    setFormData({
      tipo_expediente: "",
      descripcion: "",
      prioridad: "",
      estado_actual: "",
    });
  };

  //----------------------------------------------------------------------

  // funcion para agregar mas documentos en el modal ver

  const obtenerDocumentosExpediente = async (id_expediente) => {
    try {
      const response = await axios.get(
        `${URL_DOCUMENTOS}/expediente/${id_expediente}`
      );
      return response.data || [];
    } catch (error) {
      console.error("Error al obtener documentos del expediente:", error);
      return [];
    }
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
      ssetObservacionesDirector(data.Director || []);
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
      try {
        await axios.put(`${URL_EXPEDIENTES}/${id}/archivar`);
        alert("Expediente archivado exitosamente");
        obtenerExpedientes(); // Recargar la lista
      } catch (error) {
        console.error("Error al archivar expediente:", error);
        alert("Error al archivar el expediente");
      }
    }
  };

  // Función para manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Función para formatear fechas
  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-AR");
  };

  // Función para obtener el color del badge según el estado
  const getEstadoBadge = (estado) => {
    const estados = {
      "en revisión": "warning",
      aprobado: "success",
      rechazado: "danger",
      archivado: "secondary",
      pendiente: "info",
    };
    return estados[estado?.toLowerCase()] || "secondary";
  };

  // Función para obtener el color del badge según la prioridad
  const getPrioridadBadge = (prioridad) => {
    const prioridades = {
      alta: "danger",
      media: "warning",
      baja: "info",
    };
    return prioridades[prioridad?.toLowerCase()] || "secondary";
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <h3>Cargando expedientes...</h3>
      </Container>
    );
  }

  // Calcular filtrados y paginación
  const q = busqueda.trim().toLowerCase();
  const filtrados = expedientes.filter((e) => {
    const coincideBusqueda =
      !q ||
      String(e.numero_expediente || "")
        .toLowerCase()
        .includes(q) ||
      String(e.tipo_expediente || "")
        .toLowerCase()
        .includes(q) ||
      String(e.descripcion || "")
        .toLowerCase()
        .includes(q);

    const coincideTipo = !filtroTipo || e.tipo_expediente === filtroTipo;
    const coincideEstado =
      !filtroEstado ||
      (e.estado_actual || "").toLowerCase() === filtroEstado.toLowerCase();
    const coincidePrioridad =
      !filtroPrioridad ||
      (e.prioridad || "").toLowerCase() === filtroPrioridad.toLowerCase();

    return (
      coincideBusqueda && coincideTipo && coincideEstado && coincidePrioridad
    );
  });

  const total = filtrados.length;
  const inicio = (paginaActual - 1) * porPagina;
  const fin = paginaActual * porPagina;
  const pagina = filtrados.slice(inicio, fin);

  //---------------------------RETURN------------------------------------------

  return (
    <Container fluid className="consulta-expedientes-container">
      <div className="consulta-header">
        <h2>Consulta de Expedientes</h2>
        <Button variant="secondary" onClick={() => navigate(rutaVolver)}>
          Volver a Portada
        </Button>
      </div>

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
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por número, tipo o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="col-md-3">
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
            {!soloEstado && (
            <div className="col-md-2">
              <select
                className="form-select"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="">Estado (todos)</option>
                {[
                  "en revisión",
                  "aprobado",
                  "rechazado",
                  "pendiente",
                  "archivado",
                ].map((est) => (
                  <option key={est} value={est}>
                    {est}
                  </option>
                ))}
              </select>
            </div>
            )}
            <div className="col-md-2">
              <select
                className="form-select"
                value={filtroPrioridad}
                onChange={(e) => setFiltroPrioridad(e.target.value)}
              >
                <option value="">Prioridad (todas)</option>
                {["alta", "media", "baja"].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-1 d-grid">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setBusqueda("");
                  setFiltroEstado(soloEstado || "");
                  setFiltroPrioridad("");
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
                <th>N° Expediente</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagina.map((expediente) => (
                <tr key={expediente.id_expediente}>
                  <td>{expediente.numero_expediente}</td>
                  <td>{expediente.tipo_expediente || "N/A"}</td>
                  <td>{expediente.descripcion || "N/A"}</td>

                  <td>
                    <Badge bg={getEstadoBadge(expediente.estado_actual)}>
                      {expediente.estado_actual || "N/A"}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={getPrioridadBadge(expediente.prioridad)}>
                      {expediente.prioridad || "N/A"}
                    </Badge>
                  </td>
                  <td>{formatearFecha(expediente.fecha_creacion)}</td>
                  <td className="acciones-cell">
                    {/*boton ver*/}
                    <Button
                      variant="info"
                      size="sm"
                      className="me-1 mb-1"
                      onClick={() => abrirModal("ver", expediente)}
                    >
                      Ver
                    </Button>

                    {usuarioLog?.tipo_usuario?.toLowerCase() !==
                      "presentante" && (
                      <>
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-1 mb-1"
                          onClick={() => abrirModal("editar", expediente)}
                          disabled={expediente.estado_actual === "archivado"}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="mb-1"
                          onClick={() =>
                            archivarExpediente(expediente.id_expediente)
                          }
                          disabled={expediente.estado_actual === "archivado"}
                        >
                          Archivar
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
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
                    {expedienteSeleccionado.fecha_creacion}
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

                <Form.Group>
                  <Form.Label>Tipo</Form.Label>
                  <Form.Label className="expediente-label">
                    {expedienteSeleccionado.tipo_expediente || "Sin especificar"}
                  </Form.Label>
                </Form.Group>

                <Form.Group>
                  <Form.Label>Prioridad</Form.Label>
                  <Form.Label className="expediente-label">
                    {expedienteSeleccionado.prioridad || "Sin especificar"}
                  </Form.Label>
                </Form.Group>

                <Form.Group style={{ gridColumn: "1 / -1" }}>
                  <Form.Label>Descripción</Form.Label>
                  <Form.Label className="expediente-label" style={{ whiteSpace: "pre-wrap" }}>
                    {expedienteSeleccionado.descripcion || "Sin descripción"}
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
                          value={`• ${obs.observacion}\n(${obs.fecha_hora})`}
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
                        rows={2}
                        className="mb-2"
                        disabled
                        value={`• ${obs.observacion}\n(${obs.fecha_hora})`}
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
                  <h5>Jurídico</h5>

                  <div className="observaciones-scroll">
                  {observacionesJuridico.length > 0 ? (
                    observacionesJuridico.map((obs, i) => (
                      <Form.Control
                        key={i}
                        as="textarea"
                        rows={2}
                        className="mb-2"
                        disabled
                        value={`• ${obs.observacion}\n(${obs.fecha_hora})`}
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
                      value={`• ${obs.observacion}\n(${obs.fecha_hora})`}
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

              {/* Recepción y pases */}
              {modalType === "ver" && (
                <div className="mb-4">
                  <h5 className="mb-3">📬 Recepción</h5>
                  {(() => {
                    const recepcion = [...historialModal]
                      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
                      .find(h => h.accion?.toLowerCase().includes('recepci'));
                    return recepcion ? (
                      <p className="mb-1">
                        <strong>Recepcionado por:</strong> {recepcion.usuario_nombre} {recepcion.usuario_apellido}<br />
                        <strong>Fecha y hora:</strong> {new Date(recepcion.fecha).toLocaleString('es-AR')}
                      </p>
                    ) : (
                      <p className="text-muted">Aún no fue recepcionado.</p>
                    );
                  })()}

                  <h5 className="mt-3 mb-2">🔁 Orden de pases</h5>
                  {(() => {
                    const pases = [...historialModal]
                      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
                      .filter(h => h.tipo_accion === 'asignación');
                    return pases.length > 0 ? (
                      <ol className="ps-3">
                        {pases.map((p, i) => (
                          <li key={i}>
                            <strong>{p.usuario_nombre} {p.usuario_apellido}</strong> — {new Date(p.fecha).toLocaleString('es-AR')}
                            {p.comentario && <span className="text-muted"> ({p.comentario})</span>}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-muted">Sin pases registrados.</p>
                    );
                  })()}
                </div>
              )}

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
                            window.open(`${URL_DOCUMENTOS}/ver/${f.id_documento}`, "_blank")
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
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default ConsultaExpedientes;
