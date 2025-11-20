import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  URL_EXPEDIENTES,
  URL_USUARIOS,
  URL_HISTORIAL,
} from "../Constants/endpoints";
import { URL_DOCUMENTOS } from "../Constants/endpoints";
import { Modal, Button, Form, Alert, Pagination } from "react-bootstrap";
import "../CSS/Consulta.css";
import { PORTADA_ADMINISTRATIVO } from "../Routers/router";
import { URL_OBSERVACIONES } from "../Constants/endpoints";

export default function ConsultaAdminExpedientes() {
  const navigate = useNavigate();
  const [expedientes, setExpedientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expedienteSeleccionado, setExpedienteSeleccionado] = useState(null);
  const [usuarioDestino, setUsuarioDestino] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [procesando, setProcesando] = useState(false);
  const [estadoNuevo, setEstadoNuevo] = useState("");
  const [observacionAdmin, setObservacionAdmin] = useState("");
  const [errorObs, setErrorObs] = useState("");


  // Detalle de expediente
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [expedienteDetalle, setExpedienteDetalle] = useState(null);
  const [historialExpediente, setHistorialExpediente] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [mensajeDetalle, setMensajeDetalle] = useState({ tipo: "", texto: "" });
  // Subida de documentación desde detalle (admin/director)
  const [archivosStaged, setArchivosStaged] = useState([]); // Array<File>
  const [comentarioDoc, setComentarioDoc] = useState("");
  const [subiendoDoc, setSubiendoDoc] = useState(false);
  const [documentos, setDocumentos] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const expedientesPorPagina = 10;

  useEffect(() => {
    cargarExpedientes();
    cargarUsuariosJyT();
  }, []);

  const cargarExpedientes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(URL_EXPEDIENTES);
      const expedientesData = response.data || [];
      
      // Obtener el último responsable de cada expediente desde el historial
      const expedientesConResponsable = await Promise.all(
        expedientesData.map(async (exp) => {
          try {
            const historialResp = await axios.get(`${URL_HISTORIAL}/${exp.id_expediente}`);
            const historial = historialResp.data || [];
            
            // Buscar la última recepción (identificada por la acción que contenga "recepción")
            const ultimaRecepcion = historial.find(h => 
              h.accion?.toLowerCase().includes('recepción')
            );
            
            // Si no hay recepción, buscar la última asignación
            const ultimaAsignacion = historial.find(h => 
              h.tipo_accion === 'asignación' || h.accion?.toLowerCase().includes('asignación')
            );
            
            let estadoRecepcion = 'sin_asignar';
            let responsable = null;
            let departamento = null;
            
            if (ultimaRecepcion) {
              // Está recepcionado
              estadoRecepcion = 'recepcionado';
              responsable = {
                nombre: ultimaRecepcion.usuario_nombre,
                apellido: ultimaRecepcion.usuario_apellido
              };
              departamento = ultimaRecepcion.departamento_nombre;
            } else if (ultimaAsignacion) {
              // Está asignado pero no recepcionado
              estadoRecepcion = 'pendiente_recepcion';
              responsable = {
                nombre: ultimaAsignacion.usuario_nombre,
                apellido: ultimaAsignacion.usuario_apellido
              };
              departamento = ultimaAsignacion.departamento_nombre;
            }
            
            return {
              ...exp,
              estado_recepcion: estadoRecepcion,
              responsable_nombre: responsable?.nombre || null,
              responsable_apellido: responsable?.apellido || null,
              departamento: departamento
            };
          } catch (error) {
            console.error(`Error al cargar historial de expediente ${exp.id_expediente}:`, error);
            return { 
              ...exp, 
              estado_recepcion: 'sin_asignar',
              responsable_nombre: null, 
              responsable_apellido: null 
            };
          }
        })
      );
      
      setExpedientes(expedientesConResponsable);
    } catch (error) {
      console.error("Error al cargar expedientes:", error);
      setMensaje({ tipo: "danger", texto: "Error al cargar expedientes" });
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (exp) => {
    try {
      setMensajeDetalle({ tipo: "", texto: "" });
      setExpedienteDetalle(exp);
      setHistorialExpediente([]);
      setShowModalDetalle(true);
      setLoadingDetalle(true);

      // Cargar historial del expediente
      const respHist = await axios.get(`${URL_HISTORIAL}/${exp.id_expediente}`);
      setHistorialExpediente(respHist.data || []);

      // Cargar documentos del expediente
      setLoadingDocs(true);
      try {
        const respDocs = await axios.get(
          `${URL_DOCUMENTOS}/expediente/${exp.id_expediente}`
        );
        setDocumentos(respDocs.data || []);
      } catch (e) {
        console.error("Error al cargar documentos del expediente:", e);
      } finally {
        setLoadingDocs(false);
      }
    } catch (error) {
      console.error("Error al cargar historial:", error);
      setMensajeDetalle({
        tipo: "danger",
        texto: "Error al cargar historial del expediente",
      });
    } finally {
      setLoadingDetalle(false);
    }
  };

  const cerrarModalDetalle = () => {
    setShowModalDetalle(false);
    setExpedienteDetalle(null);
    setHistorialExpediente([]);
    setMensajeDetalle({ tipo: "", texto: "" });
    setDocumentos([]);
    setArchivosStaged([]);
    setComentarioDoc("");
  };

  const cargarUsuariosJyT = async () => {
    try {
      const response = await axios.get(URL_USUARIOS);
      // Filtrar usuarios técnicos, jurídicos y directores
      const usuariosJyT = (response.data || []).filter((u) => {
        const tipoLower = u.tipo_usuario?.toLowerCase();
        const rolLower = u.rol?.toLowerCase();
        return (
          ["tecnico", "técnico", "juridico", "jurídico"].includes(tipoLower) ||
          ["técnico", "tecnico", "jurídico", "juridico", "director"].includes(
            rolLower
          )
        );
      });
      setUsuarios(usuariosJyT);
    } catch (error) {
      console.error("Error al cargar usuarios JyT:", error);
    }
  };

  const abrirModalAsignacion = (expediente) => {
    setExpedienteSeleccionado(expediente);
    setUsuarioDestino("");
    setObservaciones("");
    setMensaje({ tipo: "", texto: "" });
    setEstadoNuevo(expediente?.estado_actual || "en revisión");
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setExpedienteSeleccionado(null);
    setUsuarioDestino("");
    setObservaciones("");
    setMensaje({ tipo: "", texto: "" });
  };

  const realizarPase = async () => {
    if (!usuarioDestino) {
      setMensaje({
        tipo: "warning",
        texto: "Debe seleccionar un usuario destino",
      });
      return;
    }

    try {
      setProcesando(true);
      setMensaje({ tipo: "", texto: "" });

      const usuarioAdmin = JSON.parse(localStorage.getItem("usuarioLogueado"));

      const paseData = {
        id_expediente: expedienteSeleccionado.id_expediente,
        id_usuario_responsable: parseInt(usuarioDestino),
        accion: "Asignación administrativa",
        comentario: observaciones || "Asignado por administrador",
        tipo_accion: "asignación",
      };

      await axios.post(URL_HISTORIAL, paseData);

      // Si se seleccionó un nuevo estado, actualizar el expediente
      if (estadoNuevo && estadoNuevo !== expedienteSeleccionado.estado_actual) {
        const payloadUpdate = {
          tipo_expediente: expedienteSeleccionado.tipo_expediente,
          descripcion: expedienteSeleccionado.descripcion,
          prioridad: expedienteSeleccionado.prioridad,
          estado_actual: estadoNuevo,
        };
        await axios.put(
          `${URL_EXPEDIENTES}/${expedienteSeleccionado.id_expediente}`,
          payloadUpdate
        );
      }

      setMensaje({
        tipo: "success",
        texto: `Expediente ${expedienteSeleccionado.numero_expediente} asignado correctamente`,
      });

      setTimeout(() => {
        cerrarModal();
        cargarExpedientes();
      }, 2000);
    } catch (error) {
      console.error("Error al realizar pase:", error);
      setMensaje({
        tipo: "danger",
        texto: error.response?.data?.error || "Error al realizar la asignación",
      });
    } finally {
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <div className="consulta-container">
        <h2>Cargando expedientes...</h2>
      </div>
    );
  }

  // Calcular expedientes a mostrar según página actual
  const indiceInicio = (paginaActual - 1) * expedientesPorPagina;
  const indiceFin = indiceInicio + expedientesPorPagina;
  const expedientesPaginados = expedientes.slice(indiceInicio, indiceFin);
  const totalPaginas = Math.ceil(expedientes.length / expedientesPorPagina);

  return (
    <div className="consulta-container">
      <div className="d-flex align-items-center justify-content-between">
        <h1 className="consulta-titulo">Consultar y Asignar Expedientes</h1>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(PORTADA_ADMINISTRATIVO)}
          title="Volver a la portada administrativa"
        >
          ← Volver
        </button>
      </div>
      <p className="consulta-subtitulo">
        Lista completa de expedientes con opción de ver detalles y asignar a
        usuarios técnicos, jurídicos o director
      </p>

      {mensaje.tipo && mensaje.texto && !showModal && (
        <Alert
          variant={mensaje.tipo}
          onClose={() => setMensaje({ tipo: "", texto: "" })}
          dismissible
        >
          {mensaje.texto}
        </Alert>
      )}

      {expedientes.length === 0 ? (
        <div className="sin-resultados">
          <p>No hay expedientes registrados en el sistema.</p>
        </div>
      ) : (
        <>
          <div className="tabla-container">
            <table className="tabla-expedientes">
              <thead>
                <tr>
                  <th>Nº Expediente</th>
                  <th>Tipo</th>
                  <th>Creado por</th>
                  <th>Estado</th>
                  <th>Prioridad</th>
                  <th>Fecha Creación</th>
                  <th>Recepcionado por</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {expedientesPaginados.map((exp) => (
                  <tr key={exp.id_expediente}>
                    <td>
                      <strong>{exp.numero_expediente}</strong>
                    </td>
                    <td>{exp.tipo_expediente || "N/A"}</td>
                    <td>
                      {exp.usuario_nombre
                        ? `${exp.usuario_nombre} ${exp.usuario_apellido}`
                        : "No especificado"}
                    </td>
                    <td>
                      <span className={`badge badge-${exp.estado_actual}`}>
                        {exp.estado_actual}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${exp.prioridad}`}>
                        {exp.prioridad}
                      </span>
                    </td>
                    <td>{new Date(exp.fecha_creacion).toLocaleDateString()}</td>
                    <td>
                      {exp.estado_recepcion === 'recepcionado' ? (
                        <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                          {`${exp.responsable_nombre} ${exp.responsable_apellido}${exp.departamento ? ` (${exp.departamento})` : ''}`}
                        </span>
                      ) : exp.estado_recepcion === 'pendiente_recepcion' ? (
                        <span style={{ color: '#ff9800', fontStyle: 'italic' }}>
                          Pendiente de recepción
                        </span>
                      ) : (
                        <span style={{ color: '#999', fontStyle: 'italic' }}>
                          Sin asignar
                        </span>
                      )}
                    </td>
                    <td className="acciones-cell">
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          className="btn btn-sm btn-accion btn-accion-ver"
                          onClick={() => verDetalle(exp)}
                          title="Ver detalles del expediente"
                        >
                          👁️ Ver
                        </button>
                        <button
                          className="btn btn-sm btn-accion btn-accion-asignar"
                          onClick={() => abrirModalAsignacion(exp)}
                          title="Asignar expediente a usuario técnico, jurídico o director"
                        >
                          📌 Asignar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Controles de Paginación */}
          {expedientes.length > expedientesPorPagina && (
            <div className="d-flex justify-content-center mt-3">
              <Pagination>
                <Pagination.First onClick={() => setPaginaActual(1)} disabled={paginaActual === 1} />
                <Pagination.Prev onClick={() => setPaginaActual(paginaActual - 1)} disabled={paginaActual === 1} />
                
                {[...Array(Math.ceil(expedientes.length / expedientesPorPagina))].map((_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === paginaActual}
                    onClick={() => setPaginaActual(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
                
                <Pagination.Next 
                  onClick={() => setPaginaActual(paginaActual + 1)} 
                  disabled={paginaActual === Math.ceil(expedientes.length / expedientesPorPagina)} 
                />
                <Pagination.Last 
                  onClick={() => setPaginaActual(Math.ceil(expedientes.length / expedientesPorPagina))} 
                  disabled={paginaActual === Math.ceil(expedientes.length / expedientesPorPagina)} 
                />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Modal de Asignación */}
      <Modal show={showModal} onHide={cerrarModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Asignar Expediente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {mensaje.tipo && mensaje.texto && (
            <Alert variant={mensaje.tipo}>{mensaje.texto}</Alert>
          )}

          {expedienteSeleccionado && (
            <>
              <div className="mb-3">
                <strong>Expediente:</strong>{" "}
                {expedienteSeleccionado.numero_expediente}
                <br />
                <strong>Tipo:</strong>{" "}
                {expedienteSeleccionado.tipo_expediente || "N/A"}
                <br />
                <strong>Estado actual:</strong>{" "}
                {expedienteSeleccionado.estado_actual}
              </div>

              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>Cambiar estado</strong>
                </Form.Label>
                <Form.Select
                  value={estadoNuevo}
                  onChange={(e) => setEstadoNuevo(e.target.value)}
                  disabled={procesando}
                >
                  <option value="en revisión">En revisión</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="rechazado">Rechazado</option>
                  <option value="archivado">Archivado</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>
                    Asignar a usuario (Técnico/Jurídico/Director) *
                  </strong>
                </Form.Label>
                <Form.Select
                  value={usuarioDestino}
                  onChange={(e) => setUsuarioDestino(e.target.value)}
                  disabled={procesando}
                >
                  <option value="">Seleccione un usuario...</option>
                  {usuarios.map((u) => (
                    <option key={u.id_usuario} value={u.id_usuario}>
                      {u.nombre} {u.apellido} ({u.rol || u.tipo_usuario})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>Observaciones</strong>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Agregue observaciones sobre la asignación..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  disabled={procesando}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={cerrarModal}
            disabled={procesando}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={realizarPase}
            disabled={procesando || !usuarioDestino}
          >
            {procesando ? "Procesando..." : "Confirmar Asignación"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Detalle de Expediente */}
      <Modal
        show={showModalDetalle}
        onHide={cerrarModalDetalle}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Detalle del Expediente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {mensajeDetalle.tipo && mensajeDetalle.texto && (
            <Alert variant={mensajeDetalle.tipo}>{mensajeDetalle.texto}</Alert>
          )}

          {!expedienteDetalle ? (
            <p className="text-muted">No hay expediente seleccionado.</p>
          ) : (
            <>
              <div className="expediente-detalle mb-4">
                <h5 className="mb-3">📋 Datos del Expediente</h5>
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <strong>Número:</strong>{" "}
                    {expedienteDetalle.numero_expediente}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Tipo:</strong>{" "}
                    {expedienteDetalle.tipo_expediente || "N/A"}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Estado:</strong>{" "}
                    <span
                      className={`badge badge-${expedienteDetalle.estado_actual}`}
                    >
                      {expedienteDetalle.estado_actual}
                    </span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Prioridad:</strong>{" "}
                    <span
                      className={`badge badge-${expedienteDetalle.prioridad}`}
                    >
                      {expedienteDetalle.prioridad}
                    </span>
                  </div>
                  <div className="col-12 mb-2">
                    <strong>Descripción:</strong>{" "}
                    {expedienteDetalle.descripcion || "Sin descripción"}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Fecha Creación:</strong>{" "}
                    {new Date(
                      expedienteDetalle.fecha_creacion
                    ).toLocaleString()}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Ubicación:</strong>{" "}
                    {expedienteDetalle.ubicacion || "Sin especificar"}
                  </div>
                  {expedienteDetalle.usuario_nombre && (
                    <div className="col-12 mb-2">
                      <strong>Creado por:</strong>{" "}
                      {expedienteDetalle.usuario_nombre}{" "}
                      {expedienteDetalle.usuario_apellido}
                    </div>
                  )}
                </div>
              </div>

              <div className="historial-expediente">
                <h5 className="mb-3">📜 Historial de Acciones</h5>
                <br />

                {/*Observaciones grales*/}

                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>Observaciones generales:</strong>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Escriba observaciones generales del expediente..."
                    value={observacionAdmin || ""}
                    onChange={(e) => {
                      setObservacionAdmin(e.target.value);
                      setErrorObs(""); // limpia error si empieza a escribir
                    }}
                    
                    isInvalid={!!errorObs}
                    disabled={subiendoDoc}
                  />

                  <Form.Control.Feedback type="invalid">
                    {errorObs}
                  </Form.Control.Feedback>

                  <Button
                    className="mt-2"
                    size="sm"
                    variant="primary"
                    onClick={async () => {

                      if (!observacionAdmin.trim()) {
                        setErrorObs("Debe escribir una observación antes de guardar.");
                        return;
                      }

                      if (!expedienteDetalle) return;
                        const usuario = JSON.parse(
                        localStorage.getItem("usuarioLogueado")
                      );
                      try {
                        await axios.post(URL_OBSERVACIONES, {
                          id_expediente: expedienteDetalle.id_expediente,
                          id_usuario: usuario.id_usuario,
                          observacion: observacionAdmin,
                        });

                        alert("Observación guardada ✅");
                        setObservacionAdmin(""); // opcional: limpiar input
                        setErrorObs("");

                      } catch (err) {
                        console.error(err);
                        alert("No se pudo guardar la observación.");

                      }

            
                      console.log("Enviando observación:", {
                      id_expediente: expedienteDetalle.id_expediente,
                      id_usuario: usuario?.id_usuario,
                      rol: usuario?.rol,
                      observacion: observacionAdmin,
                    });


                    }}
                  >
                    Guardar Observación
                  </Button>
                </Form.Group>
                
                    <hr />
                  <br />
                  
                  
                  
                {/* Carga de documentación */}
                <div className="mb-3">
                  <div className="row g-2 align-items-end">
                    <div className="col-md-5">
                      <label className="form-label">
                        <strong>Agregar documentos</strong>
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (!files.length) return;
                          const maxSize = 5 * 1024 * 1024;
                          const allowed = [
                            "application/pdf",
                            "application/msword",
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                            "image/jpeg",
                            "image/png",
                          ];
                          const valid = [];
                          const rechazados = [];
                          files.forEach((f) => {
                            if (f.size <= maxSize && allowed.includes(f.type)) {
                              valid.push(f);
                            } else {
                              rechazados.push(f.name);
                            }
                          });
                          if (rechazados.length) {
                            setMensajeDetalle({
                              tipo: "warning",
                              texto: `Archivos rechazados: ${rechazados.join(
                                ", "
                              )}`,
                            });
                          }
                          setArchivosStaged((prev) => {
                            const byKey = new Set(
                              prev.map((p) => `${p.name}|${p.size}`)
                            );
                            const toAdd = valid.filter(
                              (v) => !byKey.has(`${v.name}|${v.size}`)
                            );
                            return [...prev, ...toAdd];
                          });
                          e.target.value = "";
                        }}
                        disabled={subiendoDoc}
                      />
                    </div>
                    <div className="col-md-5">
                      <label className="form-label">
                        <strong>Comentario (opcional)</strong>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={comentarioDoc}
                        onChange={(e) => setComentarioDoc(e.target.value)}
                        disabled={subiendoDoc}
                        placeholder="Breve descripción para los documentos"
                      />
                    </div>
                    <div className="col-md-2 d-grid">
                      <button
                        className="btn btn-primary"
                        disabled={archivosStaged.length === 0 || subiendoDoc}
                        onClick={async () => {
                          try {
                            if (
                              !expedienteDetalle ||
                              archivosStaged.length === 0
                            )
                              return;
                            setSubiendoDoc(true);
                            setMensajeDetalle({ tipo: "", texto: "" });
                            const usuario = JSON.parse(
                              localStorage.getItem("usuarioLogueado")
                            );
                            let ok = 0,
                              fail = 0;
                            for (const f of archivosStaged) {
                              try {
                                const fd = new FormData();
                                fd.append("archivo", f);
                                fd.append(
                                  "id_expediente",
                                  expedienteDetalle.id_expediente
                                );
                                fd.append("subido_por", usuario?.id_usuario);
                                if (comentarioDoc?.trim())
                                  fd.append("comentario", comentarioDoc.trim());
                                await axios.post(URL_DOCUMENTOS, fd, {
                                  headers: {
                                    "Content-Type": "multipart/form-data",
                                  },
                                });
                                ok++;
                              } catch (e) {
                                console.error("Falló subida de", f.name, e);
                                fail++;
                              }
                            }
                            setMensajeDetalle({
                              tipo: fail === 0 ? "success" : "warning",
                              texto:
                                fail === 0
                                  ? `Se subieron ${ok} archivo(s)`
                                  : `Subidos ${ok}, fallidos ${fail}`,
                            });
                            setArchivosStaged([]);
                            setComentarioDoc("");
                            // refrescar historial y documentos
                            const [respHist, respDocs] = await Promise.all([
                              axios.get(
                                `${URL_HISTORIAL}/${expedienteDetalle.id_expediente}`
                              ),
                              axios.get(
                                `${URL_DOCUMENTOS}/expediente/${expedienteDetalle.id_expediente}`
                              ),
                            ]);
                            setHistorialExpediente(respHist.data || []);
                            setDocumentos(respDocs.data || []);
                          } catch (err) {
                            console.error(
                              "Error al guardar documentos (admin):",
                              err
                            );
                            setMensajeDetalle({
                              tipo: "danger",
                              texto:
                                err.response?.data?.error ||
                                "No se pudieron guardar los documentos",
                            });
                          } finally {
                            setSubiendoDoc(false);
                          }
                        }}
                      >
                        {subiendoDoc ? "Guardando…" : "Guardar"}
                      </button>
                    </div>
                  </div>

                  {/* Lista de archivos seleccionados (staging) */}
                  <div className="mt-3">
                    <h6 className="mb-2">
                      Archivos seleccionados ({archivosStaged.length})
                    </h6>
                    {archivosStaged.length === 0 ? (
                      <p className="text-muted">
                        No hay archivos en la lista de espera.
                      </p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm align-middle">
                          <thead>
                            <tr>
                              <th>Nombre</th>
                              <th>Tamaño</th>
                              <th>Tipo</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {archivosStaged.map((f, idx) => (
                              <tr key={`${f.name}-${f.size}-${idx}`}>
                                <td title={f.name}>{f.name}</td>
                                <td>{Math.round(f.size / 1024)} KB</td>
                                <td>{f.type || "-"}</td>
                                <td className="text-end">
                                  <button
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled={subiendoDoc}
                                    onClick={() =>
                                      setArchivosStaged((prev) =>
                                        prev.filter((_, i) => i !== idx)
                                      )
                                    }
                                  >
                                    Quitar
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documentos del expediente */}
                <div className="mb-3">
                  <h6 className="mb-2">📁 Documentos</h6>
                  {loadingDocs ? (
                    <p>Cargando documentos...</p>
                  ) : documentos.length === 0 ? (
                    <p className="text-muted">No hay documentos adjuntos.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle">
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Tipo</th>
                            <th>Tamaño</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documentos.map((doc) => (
                            <tr key={doc.id_documento}>
                              <td title={doc.nombre_archivo}>
                                {doc.nombre_archivo}
                              </td>
                              <td>{doc.tipo}</td>
                              <td>
                                {Math.round((doc.tamaño_archivo || 0) / 1024)}{" "}
                                KB
                              </td>
                              <td>
                                {doc.fecha_subida
                                  ? new Date(doc.fecha_subida).toLocaleString()
                                  : "-"}
                              </td>
                              <td>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={async () => {
                                    if (
                                      !window.confirm(
                                        "¿Eliminar este documento? Esta acción no se puede deshacer."
                                      )
                                    )
                                      return;
                                    try {
                                      await axios.delete(
                                        `${URL_DOCUMENTOS}/${doc.id_documento}`
                                      );
                                      // refrescar lista de documentos
                                      const respDocs = await axios.get(
                                        `${URL_DOCUMENTOS}/expediente/${expedienteDetalle.id_expediente}`
                                      );
                                      setDocumentos(respDocs.data || []);
                                    } catch (err) {
                                      console.error(
                                        "Error al eliminar documento:",
                                        err
                                      );
                                      setMensajeDetalle({
                                        tipo: "danger",
                                        texto:
                                          err.response?.data?.error ||
                                          "No se pudo eliminar el documento",
                                      });
                                    }
                                  }}
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                {loadingDetalle ? (
                  <p>Cargando historial...</p>
                ) : historialExpediente.length === 0 ? (
                  <p className="text-muted">
                    No hay registros de acciones para este expediente.
                  </p>
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
                        {historialExpediente.map((h, idx) => (
                          <tr key={idx}>
                            <td>{new Date(h.fecha).toLocaleString()}</td>
                            <td>{h.accion}</td>
                            <td>
                              {h.usuario_nombre} {h.usuario_apellido}
                            </td>
                            <td>
                              <span
                                className={`badge bg-${
                                  h.tipo_accion === "asignación"
                                    ? "primary"
                                    : h.tipo_accion === "revisión"
                                    ? "success"
                                    : "secondary"
                                }`}
                              >
                                {h.tipo_accion}
                              </span>
                            </td>
                            <td>{h.comentario || "Sin comentario"}</td>
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
          <Button variant="secondary" onClick={cerrarModalDetalle}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
