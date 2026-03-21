import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL_ROLES, URL_EXPEDIENTES_PASES, URL_HISTORIAL, URL_EXPEDIENTES, URL_DOCUMENTOS, URL_FIRMAS, URL_SUBIR_DOCUMENTO, URL_UPLOADS, URL_OBSERVACIONES } from "../Constants/endpoints";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import "../CSS/UsuarioDirector.css";

export default function UsuarioDirector() {
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

  // Estados para aprobar/rechazar expediente (integrado en modal de revisión)
  const [showModalRevision, setShowModalRevision] = useState(false);
  const [expedienteRevision, setExpedienteRevision] = useState(null);
  const [decisionTipo, setDecisionTipo] = useState(""); // "aprobar" o "rechazar"
  const [comentarioDecision, setComentarioDecision] = useState("");
  const [procesandoDecision, setProcesandoDecision] = useState(false);
  const [mensajeRevision, setMensajeRevision] = useState({ tipo: "", texto: "" });
  const [documentosRevision, setDocumentosRevision] = useState([]);
  const [loadingDocsRevision, setLoadingDocsRevision] = useState(false);
  const [archivosRevision, setArchivosRevision] = useState([]);
  const [comentarioDocRevision, setComentarioDocRevision] = useState("");
  const [historialRevision, setHistorialRevision] = useState([]);

  // Estados para firmar documento
  const [showModalFirma, setShowModalFirma] = useState(false);
  const [documentoAFirmar, setDocumentoAFirmar] = useState(null);
  const [firmasDisponibles, setFirmasDisponibles] = useState([]);
  const [firmaSeleccionada, setFirmaSeleccionada] = useState("");
  const [procesandoFirma, setProcesandoFirma] = useState(false);
  const [mensajeFirma, setMensajeFirma] = useState({ tipo: "", texto: "" });

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
            // Verificar cuáles expedientes ya fueron recepcionados por este usuario
            const expedientesConEstado = await Promise.all(
              expedientes.map(async exp => {
                try {
                  const historial = await axios.get(`${URL_HISTORIAL}/${exp.id_expediente}`);
                  const recepcionado = historial.data.some(h => 
                    h.id_usuario_responsable === idUsuario && 
                    h.accion?.toLowerCase().includes('recepción')
                  );
                  return { ...exp, recepcionado };
                } catch {
                  return { ...exp, recepcionado: false };
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
          comentario: observacionesRecepcion || "Expediente recepcionado por el Director"
        };
        return axios.post(`${URL_HISTORIAL}/recepcionar`, recepcionData);
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
                    const recepcionado = historial.data.some(h => 
                      h.id_usuario_responsable === usuarioLogueado.id_usuario && 
                      h.accion?.toLowerCase().includes('recepción')
                    );
                    return { ...exp, recepcionado };
                  } catch {
                    return { ...exp, recepcionado: false };
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

  // Nueva función para abrir modal de revisión completo
  const abrirModalRevisionCompleto = async (expediente) => {
    setExpedienteRevision(expediente);
    setShowModalRevision(true);
    setDecisionTipo("");
    setComentarioDecision("");
    setComentarioDocRevision("");
    setArchivosRevision([]);
    setMensajeRevision({ tipo: "", texto: "" });
    
    // Cargar documentos del expediente
    setLoadingDocsRevision(true);
    try {
      const resDocs = await axios.get(`${URL_DOCUMENTOS}/expediente/${expediente.id_expediente}`);
      setDocumentosRevision(resDocs.data || []);
    } catch (err) {
      console.error('Error al cargar documentos:', err);
    } finally {
      setLoadingDocsRevision(false);
    }

    // Cargar historial del expediente
    try {
      const resHist = await axios.get(`${URL_HISTORIAL}/${expediente.id_expediente}`);
      setHistorialRevision(resHist.data || []);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setHistorialRevision([]);
    }
  };

  const cerrarModalRevision = () => {
    setShowModalRevision(false);
    setExpedienteRevision(null);
    setDecisionTipo("");
    setComentarioDecision("");
    setComentarioDocRevision("");
    setArchivosRevision([]);
    setMensajeRevision({ tipo: "", texto: "" });
    setDocumentosRevision([]);
    setHistorialRevision([]);
  };

  const subirDocumentosRevision = async () => {
    if (archivosRevision.length === 0) {
      setMensajeRevision({ tipo: "warning", texto: "Debe seleccionar al menos un archivo" });
      return;
    }

    try {
      setSubiendoDoc(true);
      const user = JSON.parse(localStorage.getItem("usuarioLogueado"));
      
      for (const archivo of archivosRevision) {
        const fd = new FormData();
        fd.append('archivo', archivo);
        fd.append('id_expediente', expedienteRevision.id_expediente);
        fd.append('subido_por', user?.id_usuario);
        if (comentarioDocRevision?.trim()) {
          fd.append('comentario', comentarioDocRevision.trim());
        }
        await axios.post(URL_DOCUMENTOS, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setMensajeRevision({
        tipo: "success",
        texto: `${archivosRevision.length} archivo(s) subido(s) exitosamente`
      });

      // Recargar documentos
      const resDocs = await axios.get(`${URL_DOCUMENTOS}/expediente/${expedienteRevision.id_expediente}`);
      setDocumentosRevision(resDocs.data || []);
      
      setArchivosRevision([]);
      setComentarioDocRevision("");

    } catch (error) {
      console.error("Error al subir documentos:", error);
      setMensajeRevision({
        tipo: "danger",
        texto: error.response?.data?.error || "Error al subir documentos"
      });
    } finally {
      setSubiendoDoc(false);
    }
  };

  const confirmarDecisionRevision = async () => {
    if (!decisionTipo) {
      setMensajeRevision({ tipo: "warning", texto: "Debe seleccionar Aprobar o Rechazar" });
      return;
    }

    if (!comentarioDecision.trim()) {
      setMensajeRevision({ tipo: "warning", texto: "Debe agregar un comentario sobre la decisión" });
      return;
    }

    try {
      setProcesandoDecision(true);
      setMensajeRevision({ tipo: "", texto: "" });

      const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));
      const nuevoEstado = decisionTipo === "aprobar" ? "aprobado" : "rechazado";
      
      // Actualizar estado del expediente
      const payloadUpdate = {
        tipo_expediente: expedienteRevision.tipo_tramite || expedienteRevision.tipo_expediente,
        descripcion: expedienteRevision.descripcion,
        prioridad: expedienteRevision.prioridad || "normal",
        estado_actual: nuevoEstado,
        comentario_director: comentarioDecision
      };
      
      // Enviamos al backend
      await axios.put(`${URL_EXPEDIENTES}/${expedienteRevision.id_expediente}`, payloadUpdate);
      // Construccion mensaje automático + comentario del director
        const mensajeObservacion =
          decisionTipo === "aprobar"
            ? `• Expediente aprobado por Dirección.\n\n• Se autoriza la obra solicitada.\n\n• Observación del Director:\n${comentarioDecision}`
            : `• Expediente rechazado por Dirección.\n\n• Falta documentación o requisitos.\n\n• Observación del Director:\n${comentarioDecision}`;

        // Guardar observación para el presentante
        await axios.post(URL_OBSERVACIONES, {
          id_expediente: expedienteRevision.id_expediente,
          id_usuario: usuarioLogueado.id_usuario,
          observacion: mensajeObservacion
        });

      // Registrar en historial
          const historialData = {
        id_expediente: expedienteRevision.id_expediente,
        id_usuario_responsable: usuarioLogueado.id_usuario,
        accion: decisionTipo === "aprobar" ? "Aprobado por Dirección" : "Rechazado por Dirección",
        comentario: comentarioDecision
      };
      

      await axios.post(URL_HISTORIAL, historialData);

      // TODO: Aquí se debe disparar notificación al usuario presentante
      
      setMensajeRevision({
        tipo: "success",
        texto: `Expediente ${decisionTipo === "aprobar" ? "aprobado" : "rechazado"} exitosamente. Se notificará al usuario presentante.`
      });

      setTimeout(() => {
        cerrarModalRevision();
        // Recargar expedientes
        if (usuarioLogueado?.id_usuario) {
          setLoadingExpedientes(true);
          axios.get(`${URL_EXPEDIENTES_PASES}/${usuarioLogueado.id_usuario}`)
            .then(async res => {
              const expedientes = res.data || [];
              const expedientesConEstado = await Promise.all(
                expedientes.map(async exp => {
                  try {
                    const historial = await axios.get(`${URL_HISTORIAL}/${exp.id_expediente}`);
                    const recepcionado = historial.data.some(h => 
                      h.id_usuario_responsable === usuarioLogueado.id_usuario && 
                      (h.tipo_accion === 'revisión' || h.accion?.toLowerCase().includes('recepción'))
                    );
                    return { ...exp, recepcionado };
                  } catch {
                    return { ...exp, recepcionado: false };
                  }
                })
              );
              setExpedientesPendientes(expedientesConEstado);
            })
            .catch(err => console.error("Error al recargar expedientes:", err))
            .finally(() => setLoadingExpedientes(false));
        }
      }, 2500);

    } catch (error) {
      console.error("Error al procesar decisión:", error);
      setMensajeRevision({
        tipo: "danger",
        texto: error.response?.data?.error || "Error al procesar la decisión"
      });
    } finally {
      setProcesandoDecision(false);
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

  const cerrarModalDoc = () => {
    setShowModalDoc(false);
    setExpedienteDoc(null);
    setArchivosStaged([]);
    setComentarioDoc("");
    setMensajeDoc({ tipo: "", texto: "" });
    setDocumentosDoc([]);
  };

  const handleArchivosChange = (e) => {
    const files = Array.from(e.target.files);
    setArchivosStaged(files);
  };

  const subirDocumento = async () => {
    if (archivosStaged.length === 0) {
      setMensajeDoc({ tipo: "warning", texto: "Debe seleccionar al menos un archivo" });
      return;
    }

    try {
      setSubiendoDoc(true);
      setMensajeDoc({ tipo: "", texto: "" });

      const formData = new FormData();
      formData.append("id_expediente", expedienteDoc.id_expediente);
      formData.append("comentario", comentarioDoc || "Documento subido por el Director");
      
      archivosStaged.forEach(file => {
        formData.append("documentos", file);
      });

      await axios.post(URL_SUBIR_DOCUMENTO, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setMensajeDoc({
        tipo: "success",
        texto: "Documento(s) subido(s) exitosamente"
      });

      // Recargar documentos
      const res = await axios.get(`${URL_DOCUMENTOS}/expediente/${expedienteDoc.id_expediente}`);
      setDocumentosDoc(res.data || []);
      
      setArchivosStaged([]);
      setComentarioDoc("");

    } catch (error) {
      console.error("Error al subir documento:", error);
      setMensajeDoc({
        tipo: "danger",
        texto: error.response?.data?.error || "Error al subir el documento"
      });
    } finally {
      setSubiendoDoc(false);
    }
  };

  

  

  

  const abrirModalFirma = async (documento) => {
    setDocumentoAFirmar(documento);
    setShowModalFirma(true);
    setFirmaSeleccionada("");
    setMensajeFirma({ tipo: "", texto: "" });
    
    // Cargar firmas disponibles del usuario
    try {
      const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));
      const res = await axios.get(`${URL_FIRMAS}/usuario/${usuarioLogueado.id_usuario}`);
      setFirmasDisponibles(res.data || []);
    } catch (error) {
      console.error("Error al cargar firmas:", error);
      setMensajeFirma({ tipo: "warning", texto: "No se pudieron cargar las firmas disponibles" });
    }
  };

  const cerrarModalFirma = () => {
    setShowModalFirma(false);
    setDocumentoAFirmar(null);
    setFirmaSeleccionada("");
    setMensajeFirma({ tipo: "", texto: "" });
    setFirmasDisponibles([]);
  };

  const confirmarFirma = async () => {
    if (!firmaSeleccionada) {
      setMensajeFirma({ tipo: "warning", texto: "Debe seleccionar una firma" });
      return;
    }

    try {
      setProcesandoFirma(true);
      setMensajeFirma({ tipo: "", texto: "" });

      // Aquí deberías implementar la lógica de firmado en el backend
      // Por ahora simularemos el proceso
      await axios.post(`${URL_FIRMAS}/firmar-documento`, {
        id_documento: documentoAFirmar.id_documento,
        id_firma: firmaSeleccionada
      });

      setMensajeFirma({
        tipo: "success",
        texto: "Documento firmado exitosamente"
      });

      // Recargar documentos
      if (expedienteDoc) {
        const res = await axios.get(`${URL_DOCUMENTOS}/expediente/${expedienteDoc.id_expediente}`);
        setDocumentosDoc(res.data || []);
      }

      setTimeout(() => {
        cerrarModalFirma();
      }, 2000);

    } catch (error) {
      console.error("Error al firmar documento:", error);
      setMensajeFirma({
        tipo: "danger",
        texto: error.response?.data?.error || "Error al firmar el documento"
      });
    } finally {
      setProcesandoFirma(false);
    }
  };

  // Menú específico para Usuario Director
  const menuItems = [
    { id: "consultar-expediente", label: "Consultar Expediente", icon: "🔍", permiso: "consultar_expediente_detalle" },
    { id: "recepcion-pase", label: "Recepción", icon: "📥", permiso: "recepcion_pase" },
    { id: "aprobar-rechazar", label: "Aprobar/Rechazar", icon: "✓✗", permiso: "aprobar_rechazar" },
    { id: "firmar-documentos", label: "Firmar Documentos", icon: "✍️", permiso: "firmar_documentos" },
    { id: "reportes", label: "Reportes y Estadísticas", icon: "📊", permiso: "ver_reportes" },
    { id: "supervision-areas", label: "Supervisión de Áreas", icon: "👥", permiso: "supervisar_areas" },
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
            <h1>Portal del Director</h1>
            <p>Bienvenido al sistema de gestión de expedientes - Dirección Provincial del Agua</p>
            
            {loadingExpedientes ? (
              <p>Cargando expedientes...</p>
            ) : expedientesPendientes.length > 0 ? (
              <div className="expedientes-pendientes">
                <h2>Expedientes Pendientes de Revisión</h2>

                <div className="tabla-container">
                  <table className="tabla-expedientes">
                    <thead>
                      <tr>
                        <th>Nº Expediente</th>
                        <th>Tipo</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th>Prioridad</th>
                        <th>Fecha Pase</th>
                        <th>Desde</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expedientesPendientes.map(exp => (
                        <tr key={exp.id_expediente} style={{ opacity: exp.recepcionado ? 0.6 : 1 }}>
                          <td>
                            <strong>{exp.numero_expediente}</strong>
                            {exp.recepcionado && <span className="badge bg-success ms-2">✓ Recepcionado</span>}
                          </td>
                          <td>{exp.tipo_tramite || exp.tipo_expediente}</td>
                          <td className="descripcion-cell">{exp.descripcion || '-'}</td>
                          <td>
                            <span className={`badge-estado estado-${exp.estado || exp.estado_actual}`}>
                              {exp.estado || exp.estado_actual}
                            </span>
                          </td>
                          <td>
                            <span className={`badge badge-${exp.prioridad}`}>
                              {exp.prioridad || 'normal'}
                            </span>
                          </td>
                          <td>{exp.fecha_pase ? new Date(exp.fecha_pase).toLocaleDateString() : '-'}</td>
                          <td>{exp.desde_usuario || exp.desde_departamento || '-'}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => abrirModalRevisionCompleto(exp)}
                              title="Revisar expediente completo"
                            >
                              📋 Revisar
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
                <p>No hay expedientes pendientes de revisión</p>
              </div>
            )}
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
            <p>Gestione la recepción de expedientes asignados a la Dirección.</p>
          </div>
        );

      case "aprobar-rechazar":
        return (
          <div className="seccion-contenido">
            <h2>Aprobar o Rechazar Expedientes</h2>
            <p>Revise y apruebe o rechace expedientes según corresponda.</p>
          </div>
        );

      case "firmar-documentos":
        return (
          <div className="seccion-contenido">
            <h2>Firmar Documentos</h2>
            <p>Firme digitalmente resoluciones y documentos oficiales.</p>
          </div>
        );

      case "reportes":
        return (
          <div className="seccion-contenido">
            <h2>Reportes y Estadísticas</h2>
            <p>Consulte reportes estadísticos y de gestión del sistema.</p>
          </div>
        );

      case "supervision-areas":
        return (
          <div className="seccion-contenido">
            <h2>Supervisión de Áreas</h2>
            <p>Supervise el desempeño y carga de trabajo de las áreas técnicas y jurídicas.</p>
          </div>
        );

      case "manual-usuario":
        return (
          <div className="seccion-contenido">
            <h2>Manual de Usuario - Dirección</h2>
            <p>Consulte la documentación y guías de uso del sistema para directores.</p>
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
    <div className="director-layout">
      {/* Sidebar */}
      <aside className={`director-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <button className="director-toggle" onClick={toggleSidebar}>
          {sidebarOpen ? "◀" : "▶"}
        </button>
        {sidebarOpen && (
          <nav className="director-menu">
            {menuFiltrado.map((item) => (
              <button
                key={item.id}
                className={`director-menu-btn ${seccionActiva === item.id ? "active" : ""}`}
                onClick={() => setSeccionActiva(item.id)}
              >
                <span className="director-icon">{item.icon}</span>
                <span className="director-label">{item.label}</span>
              </button>
            ))}
            
            <button className="director-menu-btn director-salir" onClick={handleSalir}>
              <span className="director-icon">🚪</span>
              <span className="director-label">Salir</span>
            </button>
          </nav>
        )}
      </aside>

      {/* Contenido principal */}
      <main className="director-main">
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
            <Form.Label><strong>Observaciones de Dirección</strong></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Agregue observaciones desde la Dirección..."
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
            <Form.Label><strong>Seleccionar archivos oficiales</strong></Form.Label>
            <Form.Control
              type="file"
              multiple
              onChange={(e) => setArchivosStaged(Array.from(e.target.files))}
              disabled={subiendoDoc}
            />
            <Form.Text>Archivos seleccionados: {archivosStaged.length}</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label><strong>Comentario de Dirección</strong></Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Descripción de los documentos desde Dirección..."
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
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => {
                              const url = `${URL_UPLOADS}/${doc.ruta_archivo}`;
                              window.open(url, '_blank');
                            }}
                            title="Ver documento"
                          >
                            👁️
                          </button>
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => abrirModalFirma(doc)}
                            title="Firmar documento"
                          >
                            ✍️
                          </button>
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
                            title="Eliminar documento"
                          >
                            🗑️
                          </button>
                        </div>
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

      {/* Modal de Revisión Completo (Nuevo) */}
      <Modal show={showModalRevision} onHide={cerrarModalRevision} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            📋 Revisión Completa - Expediente {expedienteRevision?.numero_expediente}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {mensajeRevision.tipo && mensajeRevision.texto && (
            <Alert variant={mensajeRevision.tipo} dismissible onClose={() => setMensajeRevision({ tipo: "", texto: "" })}>
              {mensajeRevision.texto}
            </Alert>
          )}

          {expedienteRevision && (
            <>
              {/* Información del Expediente */}
              <div className="mb-4">
                <h5 className="text-primary">📄 Información del Expediente</h5>
                <table className="table table-bordered table-sm">
                  <tbody>
                    <tr>
                      <th width="30%">Número de Expediente:</th>
                      <td><strong>{expedienteRevision.numero_expediente}</strong></td>
                    </tr>
                    <tr>
                      <th>Tipo:</th>
                      <td>{expedienteRevision.tipo_tramite || expedienteRevision.tipo_expediente}</td>
                    </tr>
                    <tr>
                      <th>Descripción:</th>
                      <td>{expedienteRevision.descripcion || 'Sin descripción'}</td>
                    </tr>
                    <tr>
                      <th>Estado Actual:</th>
                      <td>
                        <span className={`badge badge-${expedienteRevision.estado || expedienteRevision.estado_actual}`}>
                          {expedienteRevision.estado || expedienteRevision.estado_actual}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <th>Prioridad:</th>
                      <td>
                        <span className={`badge badge-${expedienteRevision.prioridad}`}>
                          {expedienteRevision.prioridad || 'normal'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <th>Ubicación:</th>
                      <td>{expedienteRevision.ubicacion || 'Sin especificar'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Documentos Existentes */}
              <div className="mb-4">
                <h5 className="text-primary">📎 Documentos del Expediente</h5>
                {loadingDocsRevision ? (
                  <p>Cargando documentos...</p>
                ) : documentosRevision.length > 0 ? (
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    <table className="table table-sm table-striped">
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Tipo</th>
                          <th>Tamaño</th>
                          <th>Fecha</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documentosRevision.map(doc => (
                          <tr key={doc.id_documento}>
                            <td>{doc.nombre_archivo}</td>
                            <td>{doc.tipo}</td>
                            <td>{Math.round((doc.tamaño_archivo || 0) / 1024)} KB</td>
                            <td>{doc.fecha_subida ? new Date(doc.fecha_subida).toLocaleDateString() : '-'}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => window.open(`${URL_UPLOADS}/${doc.ruta_archivo}`, '_blank')}
                              >
                                👁️ Ver
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Alert variant="info">No hay documentos adjuntos en este expediente</Alert>
                )}
              </div>

              {/* Historial de Movimientos */}
              <div className="mb-4">
                <h5 className="text-primary">📜 Historial de Movimientos</h5>
                {historialRevision.length > 0 ? (
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
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
                        {historialRevision.map((h, idx) => (
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
                ) : (
                  <Alert variant="info">No hay historial registrado</Alert>
                )}
              </div>

              <hr />

              {/* Subir Nuevos Documentos */}
              <div className="mb-4">
                <h5 className="text-success">📤 Subir Documentos Oficiales (Opcional)</h5>
                <Form.Group className="mb-3">
                  <Form.Label><strong>Seleccionar archivos</strong></Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    onChange={(e) => setArchivosRevision(Array.from(e.target.files))}
                    disabled={subiendoDoc || procesandoDecision}
                  />
                  <Form.Text>
                    {archivosRevision.length > 0 
                      ? `${archivosRevision.length} archivo(s) seleccionado(s)` 
                      : 'Puede adjuntar resoluciones, dictámenes u otros documentos oficiales'}
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label><strong>Comentario sobre los documentos</strong></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Describa los documentos que está adjuntando..."
                    value={comentarioDocRevision}
                    onChange={(e) => setComentarioDocRevision(e.target.value)}
                    disabled={subiendoDoc || procesandoDecision}
                  />
                </Form.Group>

                <Button 
                  variant="outline-success"
                  onClick={subirDocumentosRevision}
                  disabled={archivosRevision.length === 0 || subiendoDoc || procesandoDecision}
                  className="me-2"
                >
                  {subiendoDoc ? 'Subiendo...' : '📤 Subir Documentos'}
                </Button>
              </div>

              <hr />

              {/* Decisión Final */}
              <div className="mb-3">
                <h5 className="text-danger">⚖️ Decisión Final del Director</h5>
                <Alert variant="warning">
                  <strong>Importante:</strong> Esta decisión es definitiva y se notificará al usuario presentante del trámite.
                </Alert>

                <Form.Group className="mb-3">
                  <Form.Label><strong>Seleccione su decisión *</strong></Form.Label>
                  <div className="d-flex gap-3">
                    <Form.Check
                      type="radio"
                      id="radio-aprobar"
                      label="✅ APROBAR"
                      name="decision"
                      checked={decisionTipo === 'aprobar'}
                      onChange={() => setDecisionTipo('aprobar')}
                      disabled={procesandoDecision}
                    />
                    <Form.Check
                      type="radio"
                      id="radio-rechazar"
                      label="❌ RECHAZAR"
                      name="decision"
                      checked={decisionTipo === 'rechazar'}
                      onChange={() => setDecisionTipo('rechazar')}
                      disabled={procesandoDecision}
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>
                      {decisionTipo === 'aprobar' 
                        ? 'Fundamentos de la aprobación *' 
                        : decisionTipo === 'rechazar'
                        ? 'Motivos del rechazo *'
                        : 'Comentarios sobre la decisión *'}
                    </strong>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder={
                      decisionTipo === 'aprobar'
                        ? 'Detalle los fundamentos y consideraciones para aprobar este expediente...'
                        : decisionTipo === 'rechazar'
                        ? 'Indique claramente los motivos por los cuales se rechaza este expediente...'
                        : 'Seleccione primero una decisión (Aprobar o Rechazar)'
                    }
                    value={comentarioDecision}
                    onChange={(e) => setComentarioDecision(e.target.value)}
                    disabled={procesandoDecision || !decisionTipo}
                  />
                </Form.Group>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={cerrarModalRevision}
            disabled={procesandoDecision || subiendoDoc}
          >
            Cancelar
          </Button>
          <Button 
            variant={decisionTipo === 'aprobar' ? 'success' : decisionTipo === 'rechazar' ? 'danger' : 'primary'}
            onClick={confirmarDecisionRevision}
            disabled={!decisionTipo || !comentarioDecision.trim() || procesandoDecision || subiendoDoc}
          >
            {procesandoDecision 
              ? 'Procesando...' 
              : decisionTipo === 'aprobar' 
                ? '✅ Confirmar Aprobación' 
                : decisionTipo === 'rechazar'
                ? '❌ Confirmar Rechazo'
                : 'Confirmar Decisión'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Firma Digital */}
      <Modal show={showModalFirma} onHide={cerrarModalFirma} centered>
        <Modal.Header closeButton>
          <Modal.Title>✍️ Firmar Documento Digitalmente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {mensajeFirma.tipo && mensajeFirma.texto && (
            <Alert variant={mensajeFirma.tipo}>{mensajeFirma.texto}</Alert>
          )}

          {documentoAFirmar && (
            <>
              <div className="mb-3">
                <strong>Documento:</strong> {documentoAFirmar.nombre_archivo}
                <br />
                <strong>Tipo:</strong> {documentoAFirmar.tipo}
                <br />
                <strong>Fecha subida:</strong> {documentoAFirmar.fecha_subida 
                  ? new Date(documentoAFirmar.fecha_subida).toLocaleString() 
                  : '-'}
              </div>

              <Form.Group className="mb-3">
                <Form.Label><strong>Seleccione su firma digital *</strong></Form.Label>
                <Form.Select
                  value={firmaSeleccionada}
                  onChange={(e) => setFirmaSeleccionada(e.target.value)}
                  disabled={procesandoFirma || firmasDisponibles.length === 0}
                >
                  <option value="">Seleccione una firma...</option>
                  {firmasDisponibles.map(firma => (
                    <option key={firma.id_firma} value={firma.id_firma}>
                      {firma.nombre_firma} - {firma.tipo_firma}
                    </option>
                  ))}
                </Form.Select>
                {firmasDisponibles.length === 0 && (
                  <Form.Text className="text-danger">
                    No tiene firmas digitales registradas. Debe crear una en el sistema.
                  </Form.Text>
                )}
              </Form.Group>

              <Alert variant="info">
                <small>
                  La firma digital se aplicará al documento seleccionado y quedará registrada 
                  en el sistema como parte del expediente oficial.
                </small>
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModalFirma} disabled={procesandoFirma}>
            Cancelar
          </Button>
          <Button 
            variant="primary"
            onClick={confirmarFirma}
            disabled={procesandoFirma || !firmaSeleccionada || firmasDisponibles.length === 0}
          >
            {procesandoFirma ? 'Firmando...' : '✍️ Firmar Documento'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
