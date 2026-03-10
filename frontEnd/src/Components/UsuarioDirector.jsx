  // Función para confirmar decisión en el modal de revisión (aprobar/rechazar)
  const confirmarDecisionRevision = async () => {
    if (!decisionTipo || !comentarioDecision.trim() || procesandoDecision) return;
    try {
      setProcesandoDecision(true);
      setMensajeRevision({ tipo: '', texto: '' });
      const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado'));
      const nuevoEstado = decisionTipo === 'aprobar' ? 'aprobado' : 'rechazado';
      // Actualizar estado del expediente
      const payloadUpdate = {
        tipo_expediente: expedienteRevision.tipo_tramite || expedienteRevision.tipo_expediente,
        descripcion: expedienteRevision.descripcion,
        prioridad: expedienteRevision.prioridad || 'normal',
        estado_actual: nuevoEstado,
      };
      await axios.put(`${URL_EXPEDIENTES}/${expedienteRevision.id_expediente}`, payloadUpdate);
      // Registrar en historial
      const historialData = {
        id_expediente: expedienteRevision.id_expediente,
        id_usuario_responsable: usuarioLogueado.id_usuario,
        accion: decisionTipo === 'aprobar' ? 'Aprobación Dirección' : 'Rechazo Dirección',
        comentario: comentarioDecision || `Expediente ${decisionTipo === 'aprobar' ? 'aprobado' : 'rechazado'} por el Director`,
        tipo_accion: decisionTipo === 'aprobar' ? 'aprobación' : 'rechazo',
      };
      await axios.post(URL_HISTORIAL, historialData);
      setMensajeRevision({
        tipo: 'success',
        texto: `Expediente ${decisionTipo === 'aprobar' ? 'aprobado' : 'rechazado'} exitosamente.`
      });
      setTimeout(() => {
        setShowModalRevision(false);
        setExpedienteRevision(null);
        setDecisionTipo('');
        setComentarioDecision('');
        setComentarioDocRevision('');
        setArchivosRevision([]);
        setMensajeRevision({ tipo: '', texto: '' });
        setDocumentosRevision([]);
        setHistorialRevision([]);
        // Recargar expedientes
        window.location.reload();
      }, 1800);
    } catch (error) {
      setMensajeRevision({
        tipo: 'danger',
        texto: error.response?.data?.error || 'Error al procesar la decisión'
      });
    } finally {
      setProcesandoDecision(false);
    }
  };
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL_ROLES, URL_EXPEDIENTES_PASES, URL_HISTORIAL, URL_EXPEDIENTES } from "../Constants/endpoints";
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
  const [observacionesRecepcion, setObservacionesRecepcion] = useState("");
  const [procesandoRecepcion, setProcesandoRecepcion] = useState(false);
  const [mensajeRecepcion, setMensajeRecepcion] = useState({ tipo: "", texto: "" });
  const [showModalRecepcion, setShowModalRecepcion] = useState(false);

  // Estados para consulta de expediente
  const [showModalConsulta, setShowModalConsulta] = useState(false);
  const [numeroExpedienteConsulta, setNumeroExpedienteConsulta] = useState("");
  const [expedienteConsultado, setExpedienteConsultado] = useState(null);
  // Cambiar label y placeholder para reflejar búsqueda por ID
  const [historialExpediente, setHistorialExpediente] = useState([]);
  const [loadingConsulta, setLoadingConsulta] = useState(false);
  const [mensajeConsulta, setMensajeConsulta] = useState({ tipo: "", texto: "" });

  // ...

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

  // Estados para decisión (aprobar/rechazar) - modal antiguo, ahora no se usa
  const [showModalDecision, setShowModalDecision] = useState(false);
  const [expedienteDecision, setExpedienteDecision] = useState(null);
  const [mensajeDecision, setMensajeDecision] = useState({ tipo: "", texto: "" });




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
      
      // Subida múltiple: usar 'files' para todos los archivos y endpoint /upload

      const historialData = {
        id_expediente: expedienteRevision.id_expediente,
        id_usuario_responsable: usuarioLogueado.id_usuario,
        accion: decisionTipo === "aprobar" ? "Aprobación Dirección" : "Rechazo Dirección",
        comentario: comentarioDecision,
        tipo_accion: decisionTipo === "aprobar" ? "aprobación" : "rechazo"
      };

      await axios.post(URL_HISTORIAL, historialData);

      setMensajeRevision({
        tipo: "success",
        texto: `Expediente ${decisionTipo === "aprobar" ? "aprobado" : "rechazado"} exitosamente. Se notificará al usuario presentante.`
      });
      setTimeout(() => {
        cerrarModalRevision();
        if (decisionTipo === "aprobar") {
          navigate("/ExpedientesFinalizados");
        } else {
          navigate("/ExpedientesArchivados");
        }
      }, 1800);

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



  const abrirModalDecision = (expediente, tipo) => {
    setExpedienteDecision(expediente);
    setDecisionTipo(tipo);
    setComentarioDecision("");
    setMensajeDecision({ tipo: "", texto: "" });
    setShowModalDecision(true);
  };

  const cerrarModalDecision = () => {
    setShowModalDecision(false);
    setExpedienteDecision(null);
    setDecisionTipo("");
    setComentarioDecision("");
    setMensajeDecision({ tipo: "", texto: "" });
  };

  const confirmarDecision = async () => {
    try {
      setProcesandoDecision(true);
      setMensajeDecision({ tipo: "", texto: "" });

      const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));
      const nuevoEstado = decisionTipo === "aprobar" ? "aprobado" : "rechazado";
      
      // Actualizar estado del expediente
      const payloadUpdate = {
        tipo_expediente: expedienteDecision.tipo_tramite || expedienteDecision.tipo_expediente,
        descripcion: expedienteDecision.descripcion,
        prioridad: expedienteDecision.prioridad || "normal",
        estado_actual: nuevoEstado,
      };
      
      await axios.put(`${URL_EXPEDIENTES}/${expedienteDecision.id_expediente}`, payloadUpdate);

      // Registrar en historial
      const historialData = {
        id_expediente: expedienteDecision.id_expediente,
        id_usuario_responsable: usuarioLogueado.id_usuario,
        accion: decisionTipo === "aprobar" ? "Aprobación Dirección" : "Rechazo Dirección",
        comentario: comentarioDecision || `Expediente ${decisionTipo === "aprobar" ? "aprobado" : "rechazado"} por el Director`,
        tipo_accion: decisionTipo === "aprobar" ? "aprobación" : "rechazo"
      };

      await axios.post(URL_HISTORIAL, historialData);


      setMensajeDecision({
        tipo: "success",
        texto: `Expediente ${decisionTipo === "aprobar" ? "aprobado" : "rechazado"} exitosamente`
      });
      setTimeout(() => {
        cerrarModalDecision();
        if (decisionTipo === "aprobar") {
          navigate("/ExpedientesFinalizados");
        } else {
          navigate("/ExpedientesArchivados");
        }
      }, 1800);

    } catch (error) {
      console.error("Error al procesar decisión:", error);
      setMensajeDecision({
        tipo: "danger",
        texto: error.response?.data?.error || "Error al procesar la decisión"
      });
    } finally {
      setProcesandoDecision(false);
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
    { id: "recepcionados", label: "Recepcionados", icon: "📥", permiso: "recepcion_pase" },
    { id: "finalizados", label: "Finalizados", icon: "✅", permiso: "consultar_expediente_detalle" },
    { id: "archivados", label: "Archivados", icon: "📦", permiso: "consultar_expediente_detalle" },
    // Eliminado 'Firma Digital' del menú. Solo se usará 'Firma Electrónica'.
    { id: "reportes", label: "Reportes y Estadísticas", icon: "📊", permiso: "ver_reportes" },
    { id: "supervision-areas", label: "Supervisión de Áreas", icon: "👥", permiso: "supervisar_areas" },
    { id: "manual-usuario", label: "Manual de Usuario", icon: "📖", permiso: "ver_manual_usuario" },
  ];

  const menuFiltrado = permisosUsuario.length > 0
    ? menuItems
    : menuItems;

  const renderContenido = () => {
    // Redirección directa a las páginas de finalizados y archivados
    if (seccionActiva === "finalizados") {
      window.location.href = "/ExpedientesFinalizados";
      return null;
    }
    if (seccionActiva === "archivados") {
      window.location.href = "/ExpedientesArchivados";
      return null;
    }

    switch (seccionActiva) {
            case "firma-electronica":
              // Filtrar expedientes aprobados o rechazados (pendientes de validación OTP)
              const expedientesFirmaElectronica = expedientesPendientes.filter(
                exp => ["aprobado", "rechazado"].includes((exp.estado || exp.estado_actual)?.toLowerCase())
              );
              return (
                <div className="seccion-contenido">
                  <h2>Firma Electrónica - Validación de Trámite</h2>
                  {expedientesFirmaElectronica.length === 0 ? (
                    <p>No hay expedientes pendientes de firma electrónica.</p>
                  ) : (
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
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expedientesFirmaElectronica.map((exp, idx) => (
                            <tr key={`exp-firma-elec-${exp.id_expediente}-${idx}`}>
                              <td><strong>{exp.numero_expediente}</strong></td>
                              <td>{exp.tipo_tramite || exp.tipo_expediente}</td>
                              <td className="descripcion-cell">{exp.descripcion || '-'}</td>
                              <td><span className={`badge-estado estado-${exp.estado || exp.estado_actual}`}>{exp.estado || exp.estado_actual}</span></td>
                              <td><span className={`badge badge-${exp.prioridad}`}>{exp.prioridad || 'normal'}</span></td>
                              <td>{exp.fecha_pase ? new Date(exp.fecha_pase).toLocaleDateString() : '-'}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => iniciarValidacionOTP(exp)}
                                  title="Firmar electrónicamente el expediente"
                                  disabled={procesandoOTP}
                                >
                                  🖊️ Firma Electrónica
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
      case "recepcionados":
        // Mostrar expedientes ya recepcionados
        const expedientesRecepcionados = expedientesPendientes.filter(e => e.recepcionado);
        return (
          <div className="seccion-contenido">
            <h2>Expedientes Recepcionados</h2>
            {expedientesRecepcionados.length === 0 ? (
              <p>No hay expedientes recepcionados.</p>
            ) : (
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
                    {expedientesRecepcionados.map((exp, idx) => (
                      <tr key={`exp-rev-${exp.id_expediente}-${idx}`} style={{ opacity: 0.8 }}>
                        <td><strong>{exp.numero_expediente}</strong></td>
                        <td>{exp.tipo_tramite || exp.tipo_expediente}</td>
                        <td className="descripcion-cell">{exp.descripcion || '-'}</td>
                        <td><span className={`badge-estado estado-${exp.estado || exp.estado_actual}`}>{exp.estado || exp.estado_actual}</span></td>
                        <td><span className={`badge badge-${exp.prioridad}`}>{exp.prioridad || 'normal'}</span></td>
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
            )}
          </div>
        );
      case "inicio":
        // Panel doble: Recepcionar y Revisar
        // Evitar duplicados por id_expediente
        const seen = new Set();
        const expedientesPorRecepcionar = expedientesPendientes.filter(e => {
          if (!e.recepcionado && !seen.has(e.id_expediente)) {
            seen.add(e.id_expediente);
            return true;
          }
          return false;
        });
        return (
          <div className="seccion-contenido seccion-inicio">
            <h1>Portal del Director</h1>
            <p>Bienvenido al sistema de gestión de expedientes - Dirección Provincial del Agua</p>
            {loadingExpedientes ? (
              <p>Cargando expedientes...</p>
            ) : (
              <div className="expedientes-por-recepcionar">
                <h2>Expedientes para Recepcionar</h2>
                {expedientesPorRecepcionar.length === 0 ? (
                  <p>No hay expedientes para recepcionar</p>
                ) : (
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
                        {expedientesPorRecepcionar.map((exp, idx) => (
                          <tr key={`exp-rec-${exp.id_expediente}-${idx}`}>
                            <td><strong>{exp.numero_expediente}</strong></td>
                            <td>{exp.tipo_tramite || exp.tipo_expediente}</td>
                            <td className="descripcion-cell">{exp.descripcion || '-'}</td>
                            <td><span className={`badge-estado estado-${exp.estado || exp.estado_actual}`}>{exp.estado || exp.estado_actual}</span></td>
                            <td><span className={`badge badge-${exp.prioridad}`}>{exp.prioridad || 'normal'}</span></td>
                            <td>{exp.fecha_pase ? new Date(exp.fecha_pase).toLocaleDateString() : '-'}</td>
                            <td>{exp.desde_usuario || exp.desde_departamento || '-'}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => abrirModalRecepcionDirecta(exp)}
                                title="Recepcionar expediente"
                              >
                                📥 Recepción
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            <div style={{ marginTop: 32, textAlign: "center" }}>
              <button className="btn btn-secondary" onClick={() => window.history.back()}>
                Volver
              </button>
            </div>
          </div>
        );

  // Función para recepcionar directamente desde el panel
  const abrirModalRecepcionDirecta = (expediente) => {
    setExpedientesSeleccionados([expediente.id_expediente]);
    setShowModalRecepcion(true);
    setObservacionesRecepcion("");
    setMensajeRecepcion({ tipo: "", texto: "" });
  };

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

      // Eliminado el case 'firmar-documentos'. Solo queda 'firma-electronica'.

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
            {menuFiltrado.map((item, idx) => (
              <>
                <button
                  key={item.id}
                  className={`director-menu-btn ${seccionActiva === item.id ? "active" : ""}`}
                  onClick={() => setSeccionActiva(item.id)}
                >
                  <span className="director-icon">{item.icon}</span>
                  <span className="director-label">{item.label}</span>
                </button>
                {item.id === 'recepcionados' && (
                  <button
                    key="firma-electronica"
                    className={`director-menu-btn ${seccionActiva === 'firma-electronica' ? 'active' : ''}`}
                    onClick={() => setSeccionActiva('firma-electronica')}
                  >
                    <span className="director-icon">🖊️</span>
                    <span className="director-label">Firma Electrónica</span>
                  </button>
                )}
              </>
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



      {/* Modal de Decisión (Aprobar/Rechazar) */}
      <Modal show={showModalDecision} onHide={cerrarModalDecision} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {decisionTipo === 'aprobar' ? '✓ Aprobar Expediente' : '✗ Rechazar Expediente'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {mensajeDecision.tipo && mensajeDecision.texto && (
            <Alert variant={mensajeDecision.tipo}>{mensajeDecision.texto}</Alert>
          )}
          
          {expedienteDecision && (
            <>
              <div className="mb-3">
                <strong>Expediente:</strong> {expedienteDecision.numero_expediente}
                <br />
                <strong>Tipo:</strong> {expedienteDecision.tipo_tramite || expedienteDecision.tipo_expediente}
                <br />
                <strong>Descripción:</strong> {expedienteDecision.descripcion || 'Sin descripción'}
              </div>

              <Alert variant={decisionTipo === 'aprobar' ? 'success' : 'danger'}>
                <strong>
                  {decisionTipo === 'aprobar' 
                    ? '¿Confirma que desea APROBAR este expediente?' 
                    : '¿Confirma que desea RECHAZAR este expediente?'}
                </strong>
              </Alert>

              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>
                    {decisionTipo === 'aprobar' 
                      ? 'Comentarios de aprobación' 
                      : 'Motivo del rechazo'} *
                  </strong>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder={
                    decisionTipo === 'aprobar'
                      ? 'Agregue observaciones sobre la aprobación...'
                      : 'Indique el motivo del rechazo...'
                  }
                  value={comentarioDecision}
                  onChange={(e) => setComentarioDecision(e.target.value)}
                  disabled={procesandoDecision}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModalDecision} disabled={procesandoDecision}>
            Cancelar
          </Button>
          <Button 
            variant={decisionTipo === 'aprobar' ? 'success' : 'danger'}
            onClick={confirmarDecision}
            disabled={procesandoDecision || !comentarioDecision.trim()}
          >
            {procesandoDecision 
              ? 'Procesando...' 
              : decisionTipo === 'aprobar' ? '✓ Confirmar Aprobación' : '✗ Confirmar Rechazo'}
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
              {/* Historial del expediente */}
              <div className="mb-4">
                <h5 className="text-secondary">🕓 Historial del Expediente</h5>
                {historialRevision && historialRevision.length > 0 ? (
                  <div className="tabla-container">
                    <table className="table table-bordered table-sm">
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
                          <tr key={`historial-rev-${idx}`}>
                            <td>{h.fecha ? new Date(h.fecha).toLocaleString() : '-'}</td>
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
            disabled={procesandoDecision}
          >
            Cancelar
          </Button>
          <Button 
            variant={decisionTipo === 'aprobar' ? 'success' : decisionTipo === 'rechazar' ? 'danger' : 'primary'}
            onClick={confirmarDecisionRevision}
            disabled={!decisionTipo || !comentarioDecision.trim() || procesandoDecision}
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

    </div>
  );
}
