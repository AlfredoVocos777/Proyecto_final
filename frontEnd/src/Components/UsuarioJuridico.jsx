import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL_ROLES, URL_EXPEDIENTES_PASES, URL_HISTORIAL, URL_EXPEDIENTES, URL_DOCUMENTOS } from "../Constants/endpoints";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import "../CSS/UsuarioJuridico.css";

export default function UsuarioJuridico() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [seccionActiva, setSeccionActiva] = useState("inicio");
  const [permisosUsuario, setPermisosUsuario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expedientesPendientes, setExpedientesPendientes] = useState([]);
  const [loadingExpedientes, setLoadingExpedientes] = useState(false);
  
  // Estados para recepción
  const [expedientesSeleccionados, setExpedientesSeleccionados] = useState([]);
  const [showModalRecepcion, setShowModalRecepcion] = useState(false);
  const [observacionesRecepcion, setObservacionesRecepcion] = useState("");
  const [procesandoRecepcion, setProcesandoRecepcion] = useState(false);
  const [mensajeRecepcion, setMensajeRecepcion] = useState({ tipo: "", texto: "" });

  // Estados para consulta de expediente
  const [showModalConsulta, setShowModalConsulta] = useState(false);
  const [numeroExpedienteConsulta, setNumeroExpedienteConsulta] = useState("");
  const [expedienteConsultado, setExpedienteConsultado] = useState(null);
  const [historialExpediente, setHistorialExpediente] = useState([]);
  const [loadingConsulta, setLoadingConsulta] = useState(false);
  const [mensajeConsulta, setMensajeConsulta] = useState({ tipo: "", texto: "" });

  // Estados para subir documentación
  const [showModalDoc, setShowModalDoc] = useState(false);
  const [expedienteDoc, setExpedienteDoc] = useState(null);
  const [archivosStaged, setArchivosStaged] = useState([]);
  const [comentarioDoc, setComentarioDoc] = useState("");
  const [subiendoDoc, setSubiendoDoc] = useState(false);
  const [mensajeDoc, setMensajeDoc] = useState({ tipo: "", texto: "" });
  const [documentosDoc, setDocumentosDoc] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("usuarioLogueado");
      const user = raw ? JSON.parse(raw) : null;
      const idRol = user?.id_rol;
      const idUsuario = user?.id_usuario;
      
      if (!idRol) {
        setLoading(false);
        return;
      }
      
      // Cargar permisos
      axios.get(`${URL_ROLES}/${idRol}`)
        .then(res => {
          const perms = (res?.data?.permisos || []).map(p => p.nombre);
          setPermisosUsuario(perms);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
      
      // Cargar expedientes asignados
      if (idUsuario) {
        setLoadingExpedientes(true);
        axios.get(`${URL_EXPEDIENTES_PASES}/${idUsuario}`)
          .then(async res => {
            const expedientes = res.data || [];
            const expedientesConEstado = await Promise.all(
              expedientes.map(async exp => {
                try {
                  const historial = await axios.get(`${URL_HISTORIAL}/${exp.id_expediente}`);
                  
                  const recepcionPorUsuario = historial.data.find(h => 
                    h.id_usuario_responsable === idUsuario && 
                    (h.tipo_accion === 'revisión' || h.accion?.toLowerCase().includes('recepción'))
                  );
                  
                  const ultimaRecepcion = historial.data
                    .filter(h => h.tipo_accion === 'revisión' || h.accion?.toLowerCase().includes('recepción'))
                    .sort((a, b) => new Date(b.fecha_accion) - new Date(a.fecha_accion))[0];
                  
                  const puedeHacerPase = ultimaRecepcion && ultimaRecepcion.id_usuario_responsable === idUsuario;
                  
                  return { 
                    ...exp, 
                    recepcionado: !!recepcionPorUsuario,
                    puedeHacerPase: puedeHacerPase 
                  };
                } catch {
                  return { ...exp, recepcionado: false, puedeHacerPase: false };
                }
              })
            );
            setExpedientesPendientes(expedientesConEstado);
          })
          .catch(err => {
            console.error("Error al cargar expedientes con pase:", err);
          })
          .finally(() => setLoadingExpedientes(false));
      }
    } catch {
      setLoading(false);
    }
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleSalir = () => {
    localStorage.removeItem("usuarioLogueado");
    navigate("/");
  };

  const toggleSeleccion = (idExpediente) => {
    setExpedientesSeleccionados(prev => {
      if (prev.includes(idExpediente)) {
        return prev.filter(id => id !== idExpediente);
      } else {
        return [...prev, idExpediente];
      }
    });
  };

  const toggleSeleccionTodos = () => {
    // Solo seleccionar expedientes no recepcionados
    const expedientesNoRecepcionados = expedientesPendientes.filter(exp => !exp.recepcionado);
    if (expedientesSeleccionados.length === expedientesNoRecepcionados.length) {
      setExpedientesSeleccionados([]);
    } else {
      setExpedientesSeleccionados(expedientesNoRecepcionados.map(exp => exp.id_expediente));
    }
  };

  const abrirModalRecepcion = () => {
    if (expedientesSeleccionados.length === 0) {
      alert("Debe seleccionar al menos un expediente para recepcionar");
      return;
    }
    setShowModalRecepcion(true);
    setObservacionesRecepcion("");
    setMensajeRecepcion({ tipo: "", texto: "" });
  };

  const cerrarModalRecepcion = () => {
    setShowModalRecepcion(false);
    setObservacionesRecepcion("");
    setMensajeRecepcion({ tipo: "", texto: "" });
  };

  const confirmarRecepcion = async () => {
    try {
      setProcesandoRecepcion(true);
      setMensajeRecepcion({ tipo: "", texto: "" });

      const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));
      
      const promesas = expedientesSeleccionados.map(idExpediente => {
        const recepcionData = {
          id_expediente: idExpediente,
          id_usuario_responsable: usuarioLogueado.id_usuario,
          accion: "Recepción jurídica de expediente",
          comentario: observacionesRecepcion || "Expediente recepcionado por área jurídica",
          tipo_accion: "revisión"
        };
        return axios.post(URL_HISTORIAL, recepcionData);
      });

      await Promise.all(promesas);

      setMensajeRecepcion({
        tipo: "success",
        texto: `${expedientesSeleccionados.length} expediente(s) recepcionado(s) exitosamente`
      });

      setTimeout(() => {
        cerrarModalRecepcion();
        setExpedientesSeleccionados([]);
        const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));
        if (usuarioLogueado?.id_usuario) {
          setLoadingExpedientes(true);
          axios.get(`${URL_EXPEDIENTES_PASES}/${usuarioLogueado.id_usuario}`)
            .then(async res => {
              const expedientes = res.data || [];
              const expedientesConEstado = await Promise.all(
                expedientes.map(async exp => {
                  try {
                    const historial = await axios.get(`${URL_HISTORIAL}/${exp.id_expediente}`);
                    
                    const recepcionPorUsuario = historial.data.find(h => 
                      h.id_usuario_responsable === usuarioLogueado.id_usuario && 
                      (h.tipo_accion === 'revisión' || h.accion?.toLowerCase().includes('recepción'))
                    );
                    
                    const ultimaRecepcion = historial.data
                      .filter(h => h.tipo_accion === 'revisión' || h.accion?.toLowerCase().includes('recepción'))
                      .sort((a, b) => new Date(b.fecha_accion) - new Date(a.fecha_accion))[0];
                    
                    const puedeHacerPase = ultimaRecepcion && ultimaRecepcion.id_usuario_responsable === usuarioLogueado.id_usuario;
                    
                    return { 
                      ...exp, 
                      recepcionado: !!recepcionPorUsuario,
                      puedeHacerPase: puedeHacerPase 
                    };
                  } catch {
                    return { ...exp, recepcionado: false, puedeHacerPase: false };
                  }
                })
              );
              setExpedientesPendientes(expedientesConEstado);
            })
            .catch(err => console.error("Error al recargar expedientes:", err))
            .finally(() => setLoadingExpedientes(false));
        }
      }, 2000);
    } catch (error) {
      console.error("Error al recepcionar:", error);
      setMensajeRecepcion({
        tipo: "danger",
        texto: error.response?.data?.error || "Error al procesar la recepción"
      });
    } finally {
      setProcesandoRecepcion(false);
    }
  };

  const abrirModalConsulta = () => {
    setShowModalConsulta(true);
    setNumeroExpedienteConsulta("");
    setExpedienteConsultado(null);
    setHistorialExpediente([]);
    setMensajeConsulta({ tipo: "", texto: "" });
  };

  const cerrarModalConsulta = () => {
    setShowModalConsulta(false);
    setNumeroExpedienteConsulta("");
    setExpedienteConsultado(null);
    setHistorialExpediente([]);
    setMensajeConsulta({ tipo: "", texto: "" });
  };

  const buscarExpediente = async () => {
    if (!numeroExpedienteConsulta.trim()) {
      setMensajeConsulta({ tipo: "warning", texto: "Ingrese un número de expediente" });
      return;
    }

    try {
      setLoadingConsulta(true);
      setMensajeConsulta({ tipo: "", texto: "" });

      const resExp = await axios.get(`${URL_EXPEDIENTES}/numero/${numeroExpedienteConsulta}`);
      setExpedienteConsultado(resExp.data);

      const resHist = await axios.get(`${URL_HISTORIAL}/${resExp.data.id_expediente}`);
      setHistorialExpediente(resHist.data || []);
    } catch (error) {
      console.error("Error al buscar expediente:", error);
      setMensajeConsulta({
        tipo: "danger",
        texto: error.response?.data?.error || "Expediente no encontrado"
      });
      setExpedienteConsultado(null);
      setHistorialExpediente([]);
    } finally {
      setLoadingConsulta(false);
    }
  };

  const abrirModalDoc = (expediente) => {
    setExpedienteDoc(expediente);
    setShowModalDoc(true);
    setArchivosStaged([]);
    setComentarioDoc("");
    setMensajeDoc({ tipo: "", texto: "" });
    setLoadingDocs(true);
    axios.get(`${URL_DOCUMENTOS}/expediente/${expediente.id_expediente}`)
      .then(res => setDocumentosDoc(res.data || []))
      .catch(err => console.error('Error al cargar documentos:', err))
      .finally(() => setLoadingDocs(false));
  };

  // Menú específico para Usuario Jurídico
  const menuItems = [
    { id: "realizar-pase", label: "Realizar Pase", icon: "➤", permiso: "realizar_pase" },
    { id: "deshacer-pase", label: "Deshacer Pase", icon: "↶", permiso: "deshacer_pase" },
    { id: "consultar-expediente", label: "Consultar Expediente", icon: "🔍", permiso: "consultar_expediente_detalle" },
    { id: "recepcion-pase", label: "Recepción", icon: "📥", permiso: "recepcion_pase" },
    { id: "dictamen-legal", label: "Dictamen Legal", icon: "⚖️", permiso: "emitir_dictamen" },
    { id: "resoluciones", label: "Resoluciones", icon: "📜", permiso: "gestionar_resoluciones" },
    { id: "manual-usuario", label: "Manual de Usuario", icon: "📖", permiso: "ver_manual_usuario" },
  ];

  const menuFiltrado = permisosUsuario.length > 0
    ? menuItems.filter(m => permisosUsuario.includes(m.permiso))
    : menuItems;

  const renderContenido = () => {
    switch (seccionActiva) {
      case "inicio":
        return (
          <div className="seccion-contenido seccion-inicio">
            <h1>Portal de Usuario Jurídico</h1>
            <p>Bienvenido al sistema de gestión de expedientes - Área Jurídica</p>
            
            {loadingExpedientes ? (
              <p>Cargando expedientes...</p>
            ) : expedientesPendientes.length > 0 ? (
              <div className="expedientes-pendientes">
                <h2>Expedientes con Pase Pendiente de Recepción</h2>
                
                <div className="acciones-seleccion">
                  <Button
                    variant="primary"
                    onClick={abrirModalRecepcion}
                    disabled={expedientesSeleccionados.length === 0}
                  >
                    Recepcionar Seleccionados ({expedientesSeleccionados.length})
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={toggleSeleccionTodos}
                    disabled={expedientesPendientes.filter(exp => !exp.recepcionado).length === 0}
                  >
                    {expedientesSeleccionados.length === expedientesPendientes.filter(exp => !exp.recepcionado).length && expedientesPendientes.filter(exp => !exp.recepcionado).length > 0
                      ? "Deseleccionar Todos"
                      : "Seleccionar Todos"}
                  </Button>
                </div>

                <div className="tabla-container">
                  <table className="tabla-expedientes">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={
                              expedientesPendientes.filter(exp => !exp.recepcionado).length > 0 &&
                              expedientesSeleccionados.length === expedientesPendientes.filter(exp => !exp.recepcionado).length
                            }
                            onChange={toggleSeleccionTodos}
                            disabled={expedientesPendientes.filter(exp => !exp.recepcionado).length === 0}
                          />
                        </th>
                        <th>Nº Expediente</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Fecha Pase</th>
                        <th>Desde</th>
                        <th>Observaciones</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expedientesPendientes.map(exp => (
                        <tr key={exp.id_expediente} style={{ opacity: exp.recepcionado ? 0.6 : 1 }}>
                          <td>
                            <input
                              type="checkbox"
                              checked={expedientesSeleccionados.includes(exp.id_expediente)}
                              onChange={() => toggleSeleccion(exp.id_expediente)}
                              disabled={exp.recepcionado}
                            />
                          </td>
                          <td>
                            <strong>{exp.numero_expediente}</strong>
                            {exp.recepcionado && <span className="badge bg-success ms-2">✓ Recepcionado</span>}
                            {exp.recepcionado && !exp.puedeHacerPase && (
                              <span className="badge bg-warning text-dark ms-2" title="Solo quien recepcionó puede hacer pases">
                                🔒 Sin permiso de pase
                              </span>
                            )}
                          </td>
                          <td>{exp.tipo_tramite}</td>
                          <td>
                            <span className={`badge-estado estado-${exp.estado}`}>
                              {exp.estado}
                            </span>
                          </td>
                          <td>{exp.fecha_pase ? new Date(exp.fecha_pase).toLocaleDateString() : '-'}</td>
                          <td>{exp.desde_usuario || exp.desde_departamento || '-'}</td>
                          <td>{exp.observaciones_pase || '-'}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => abrirModalDoc(exp)}
                            >
                              📄 Docs
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="sin-expedientes">
                <p>No hay expedientes pendientes de recepción</p>
              </div>
            )}
          </div>
        );

      case "realizar-pase":
        return (
          <div className="seccion-contenido">
            <h2>Realizar Pase Legal</h2>
            <Alert variant="info" className="mb-3">
              <strong>Importante:</strong> Solo puede realizar pases de expedientes que usted haya recepcionado previamente.
            </Alert>
            
            {expedientesPendientes.filter(exp => exp.puedeHacerPase).length > 0 ? (
              <>
                <p>Expedientes disponibles para realizar pase:</p>
                <div className="tabla-container">
                  <table className="tabla-expedientes">
                    <thead>
                      <tr>
                        <th>Nº Expediente</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expedientesPendientes
                        .filter(exp => exp.puedeHacerPase)
                        .map(exp => (
                          <tr key={exp.id_expediente}>
                            <td><strong>{exp.numero_expediente}</strong></td>
                            <td>{exp.tipo_tramite}</td>
                            <td>
                              <span className={`badge-estado estado-${exp.estado}`}>
                                {exp.estado}
                              </span>
                            </td>
                            <td>
                              <button className="btn btn-sm btn-primary">
                                ➤ Realizar Pase
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <Alert variant="warning">
                No tiene expedientes disponibles para realizar pases. Debe recepcionar expedientes primero.
              </Alert>
            )}
          </div>
        );

      case "deshacer-pase":
        return (
          <div className="seccion-contenido">
            <h2>Deshacer Pase</h2>
            <p>Gestione la anulación de pases realizados previamente.</p>
          </div>
        );

      case "consultar-expediente":
        return (
          <div className="seccion-contenido">
            <h2>Consultar Expediente</h2>
            <Button variant="primary" onClick={abrirModalConsulta}>
              🔍 Buscar Expediente
            </Button>
          </div>
        );

      case "recepcion-pase":
        return (
          <div className="seccion-contenido">
            <h2>Recepción de Expedientes</h2>
            <p>Gestione la recepción de expedientes asignados al área jurídica.</p>
          </div>
        );

      case "dictamen-legal":
        return (
          <div className="seccion-contenido">
            <h2>Dictamen Legal</h2>
            <p>Emita dictámenes legales sobre los expedientes asignados.</p>
          </div>
        );

      case "resoluciones":
        return (
          <div className="seccion-contenido">
            <h2>Gestión de Resoluciones</h2>
            <p>Administre las resoluciones y disposiciones legales de los expedientes.</p>
          </div>
        );

      case "manual-usuario":
        return (
          <div className="seccion-contenido">
            <h2>Manual de Usuario - Área Jurídica</h2>
            <p>Consulte la documentación y guías de uso del sistema para usuarios jurídicos.</p>
          </div>
        );

      default:
        return (
          <div className="seccion-contenido">
            <h2>Sección en desarrollo</h2>
            <p>Esta funcionalidad estará disponible próximamente.</p>
          </div>
        );
    }
  };

  return (
    <div className="juridico-layout">
      {/* Sidebar */}
      <aside className={`juridico-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <button className="juridico-toggle" onClick={toggleSidebar}>
          {sidebarOpen ? "◀" : "▶"}
        </button>
        {sidebarOpen && (
          <nav className="juridico-menu">
            {menuFiltrado.map((item) => (
              <button
                key={item.id}
                className={`juridico-menu-btn ${seccionActiva === item.id ? "active" : ""}`}
                onClick={() => setSeccionActiva(item.id)}
              >
                <span className="juridico-icon">{item.icon}</span>
                <span className="juridico-label">{item.label}</span>
              </button>
            ))}
            
            <button className="juridico-menu-btn juridico-salir" onClick={handleSalir}>
              <span className="juridico-icon">🚪</span>
              <span className="juridico-label">Salir</span>
            </button>
          </nav>
        )}
      </aside>

      {/* Contenido principal */}
      <main className="juridico-main">
        {loading ? <p>Cargando permisos...</p> : renderContenido()}
      </main>

      {/* Modal de Recepción */}
      <Modal show={showModalRecepcion} onHide={cerrarModalRecepcion} centered>
        <Modal.Header closeButton>
          <Modal.Title>Recepcionar Expedientes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {mensajeRecepcion.tipo && mensajeRecepcion.texto && (
            <Alert variant={mensajeRecepcion.tipo}>
              {mensajeRecepcion.texto}
            </Alert>
          )}
          <p><strong>Expedientes seleccionados:</strong> {expedientesSeleccionados.length}</p>
          <Form.Group className="mb-3">
            <Form.Label><strong>Observaciones Legales</strong></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Agregue observaciones legales sobre la recepción..."
              value={observacionesRecepcion}
              onChange={(e) => setObservacionesRecepcion(e.target.value)}
              disabled={procesandoRecepcion}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModalRecepcion} disabled={procesandoRecepcion}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={confirmarRecepcion} disabled={procesandoRecepcion}>
            {procesandoRecepcion ? "Procesando..." : "Confirmar Recepción"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Consulta */}
      <Modal show={showModalConsulta} onHide={cerrarModalConsulta} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Consultar Expediente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {mensajeConsulta.tipo && mensajeConsulta.texto && (
            <Alert variant={mensajeConsulta.tipo}>{mensajeConsulta.texto}</Alert>
          )}
          <Form.Group className="mb-3">
            <Form.Label><strong>Número de Expediente</strong></Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="Ej: EXP-2025-001"
                value={numeroExpedienteConsulta}
                onChange={(e) => setNumeroExpedienteConsulta(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && buscarExpediente()}
              />
              <Button variant="primary" onClick={buscarExpediente} disabled={loadingConsulta}>
                {loadingConsulta ? "Buscando..." : "Buscar"}
              </Button>
            </div>
          </Form.Group>

          {expedienteConsultado && (
            <div className="expediente-detalle mt-4">
              <h5>Información del Expediente</h5>
              <table className="table table-bordered">
                <tbody>
                  <tr><th>Número:</th><td>{expedienteConsultado.numero_expediente}</td></tr>
                  <tr><th>Tipo:</th><td>{expedienteConsultado.tipo_tramite}</td></tr>
                  <tr><th>Estado:</th><td>{expedienteConsultado.estado}</td></tr>
                  <tr><th>Descripción:</th><td>{expedienteConsultado.descripcion}</td></tr>
                  <tr><th>Fecha Creación:</th><td>{new Date(expedienteConsultado.fecha_creacion).toLocaleDateString()}</td></tr>
                </tbody>
              </table>

              {historialExpediente.length > 0 && (
                <>
                  <h5 className="mt-4">Historial de Movimientos</h5>
                  <div className="tabla-historial-container" style={{maxHeight: '300px', overflowY: 'auto'}}>
                    <table className="table table-sm table-striped">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Acción</th>
                          <th>Usuario</th>
                          <th>Comentario</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historialExpediente.map((h, idx) => (
                          <tr key={idx}>
                            <td>{new Date(h.fecha_accion).toLocaleString()}</td>
                            <td>{h.accion}</td>
                            <td>{h.usuario_nombre || 'Sistema'}</td>
                            <td>{h.comentario}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModalConsulta}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Documentos */}
      <Modal show={showModalDoc} onHide={() => setShowModalDoc(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Documentos del Expediente {expedienteDoc?.numero_expediente}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {mensajeDoc.tipo && mensajeDoc.texto && (
            <Alert variant={mensajeDoc.tipo}>{mensajeDoc.texto}</Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label><strong>Seleccionar archivos legales</strong></Form.Label>
            <Form.Control
              type="file"
              multiple
              onChange={(e) => setArchivosStaged(Array.from(e.target.files))}
              disabled={subiendoDoc}
            />
            <Form.Text>Archivos seleccionados: {archivosStaged.length}</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label><strong>Comentario legal</strong></Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Descripción legal de los documentos..."
              value={comentarioDoc}
              onChange={(e) => setComentarioDoc(e.target.value)}
              disabled={subiendoDoc}
            />
          </Form.Group>

          {loadingDocs ? (
            <p>Cargando documentos existentes...</p>
          ) : documentosDoc.length > 0 && (
            <div className="documentos-existentes mt-4">
              <h6>Documentos existentes</h6>
              <table className="table table-sm">
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
                  {documentosDoc.map(doc => (
                    <tr key={doc.id_documento}>
                      <td title={doc.nombre_archivo}>{doc.nombre_archivo}</td>
                      <td>{doc.tipo}</td>
                      <td>{Math.round((doc.tamaño_archivo || 0) / 1024)} KB</td>
                      <td>{doc.fecha_subida ? new Date(doc.fecha_subida).toLocaleString() : '-'}</td>
                      <td>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={async () => {
                            if (!window.confirm('¿Eliminar este documento?')) return;
                            try {
                              await axios.delete(`${URL_DOCUMENTOS}/${doc.id_documento}`);
                              const resp = await axios.get(`${URL_DOCUMENTOS}/expediente/${expedienteDoc.id_expediente}`);
                              setDocumentosDoc(resp.data || []);
                            } catch (err) {
                              console.error('Error al eliminar documento:', err);
                              setMensajeDoc({ tipo: 'danger', texto: err.response?.data?.error || 'No se pudo eliminar el documento' });
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalDoc(false)} disabled={subiendoDoc}>
            Cancelar
          </Button>
          <Button 
            variant="primary"
            disabled={archivosStaged.length === 0 || subiendoDoc}
            onClick={async () => {
              try {
                if (!archivosStaged.length) return;
                setSubiendoDoc(true);
                setMensajeDoc({ tipo: "", texto: "" });
                const user = JSON.parse(localStorage.getItem("usuarioLogueado"));
                let ok = 0, fail = 0;
                for (const f of archivosStaged) {
                  try {
                    const fd = new FormData();
                    fd.append('archivo', f);
                    fd.append('id_expediente', expedienteDoc.id_expediente);
                    fd.append('subido_por', user?.id_usuario);
                    if (comentarioDoc?.trim()) fd.append('comentario', comentarioDoc.trim());
                    await axios.post(URL_DOCUMENTOS, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                    ok++;
                  } catch (e) {
                    console.error('Falló subida de', f.name, e);
                    fail++;
                  }
                }
                const msg = fail === 0
                  ? `Se subieron ${ok} archivo(s)`
                  : `Subidos ${ok}, fallidos ${fail}`;
                setMensajeDoc({ tipo: fail === 0 ? 'success' : 'warning', texto: msg });
                const resp = await axios.get(`${URL_DOCUMENTOS}/expediente/${expedienteDoc.id_expediente}`);
                setDocumentosDoc(resp.data || []);
                setArchivosStaged([]);
              } catch (err) {
                console.error('Error en guardado de documentos:', err);
                setMensajeDoc({ tipo: 'danger', texto: err.response?.data?.error || 'Error al guardar documentos' });
              } finally {
                setSubiendoDoc(false);
              }
            }}
          >
            {subiendoDoc ? 'Guardando…' : 'Guardar documentos'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
