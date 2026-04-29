import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { URL_ROLES, URL_EXPEDIENTES_PASES, URL_HISTORIAL, URL_EXPEDIENTES, URL_DOCUMENTOS, URL_FIRMAS, URL_SUBIR_DOCUMENTO, URL_UPLOADS, URL_OBSERVACIONES } from "../Constants/endpoints";
import { Modal, Button, Form, Alert, Nav } from "react-bootstrap";
import "../CSS/UsuarioDirector.css";
import BotonesReporte from "./BotonesReporte";

export default function UsuarioDirector() {
  const navigate = useNavigate();
  const [seccionActiva, setSeccionActiva] = useState("bandeja");
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [navPreviewUrl, setNavPreviewUrl] = useState(null);
  const [permisosUsuario, setPermisosUsuario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expedientesPendientes, setExpedientesPendientes] = useState([]);
  const [loadingExpedientes, setLoadingExpedientes] = useState(false);
  const [paginaBandeja, setPaginaBandeja] = useState(1);
  const [paginaConsulta, setPaginaConsulta] = useState(1);
  
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
  const [modalSoloVer, setModalSoloVer] = useState(false);
  const [historialDoc, setHistorialDoc] = useState([]);

  // Estados para Observaciones (Director)
  const [observacionesExps, setObservacionesExps] = useState([]); // Histórico para el modal
  const [observacionDirector, setObservacionDirector] = useState("");
  const [errorObs, setErrorObs] = useState("");
  const [subiendoObs, setSubiendoObs] = useState(false);

  const cargarObservaciones = async (idExp) => {
    try {
      const res = await axios.get(`${URL_OBSERVACIONES}/${idExp}`);
      const data = res.data || {};
      const todas = [
        ...(data.Director || []).map(o => ({ ...o, rol: 'Director' }))
      ].sort((a,b) => new Date(b.fecha_hora) - new Date(a.fecha_hora));
      setObservacionesExps(todas);
    } catch (err) {
      console.error("Error al cargar observaciones:", err);
    }
  };

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

  // Estados para consulta general
  const [expedientesTodos, setExpedientesTodos] = useState([]);
  const [loadingTodos, setLoadingTodos] = useState(false);
  const [filtroConsulta, setFiltroConsulta] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [mostrarPickerFecha, setMostrarPickerFecha] = useState(false);

  useEffect(() => {
    // Cargar todos los expedientes para la consulta general
    setLoadingTodos(true);
    axios.get(URL_EXPEDIENTES)
      .then(res => setExpedientesTodos(res.data || []))
      .catch(() => setExpedientesTodos([]))
      .finally(() => setLoadingTodos(false));
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
      
      /*
        BLOQUE: GESTIÓN DE BANDEJA Y MÁQUINA DE ESTADOS (DIRECTOR)
        A diferencia del técnico y jurídico, el Director evalúa los expedientes 
        en la parte final de la cadena de mando.
        El código carga todos los expedientes que le pasaron al Director, y mediante
        una consulta cruzada al Historial marca cuáles ya recepcionó y cuáles le faltan.
        ¡Un Director no puede Aprobar/Rechazar un exp que aún dice 'Nuevo' en su bandeja!
      */
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
                  const historialData = historial.data || [];
                  const recepcionado = historialData.some(h => 
                    Number(h.id_usuario_responsable) === Number(idUsuario) && 
                    h.accion?.toLowerCase().includes('recepci')
                  );

                  // --- Calcular fecha de pase y datos de asignación ---
                  const ultimoAsignadoAUsuario = historialData
                    .filter(h => h.id_usuario_responsable === idUsuario)
                    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];

                  let fechaPase = exp.fecha_creacion;
                  let observacionesPase = '';
                  let desdeUsuario = '-';

                  if (ultimoAsignadoAUsuario) {
                    fechaPase = ultimoAsignadoAUsuario.fecha;
                    observacionesPase = ultimoAsignadoAUsuario.comentario || '';
                    const historialAsc = [...historialData].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
                    const idxEnAsc = historialAsc.findIndex(h => h.id_historial === ultimoAsignadoAUsuario.id_historial);
                    if (idxEnAsc > 0) {
                      const entradaAnterior = historialAsc[idxEnAsc - 1];
                      desdeUsuario = `${entradaAnterior.usuario_nombre || ''} ${entradaAnterior.usuario_apellido || ''}`.trim() || '-';
                    }
                  }

                  return { 
                    ...exp, 
                    recepcionado,
                    fecha_pase: fechaPase,
                    desde_usuario: desdeUsuario,
                    observaciones_pase: observacionesPase
                  };
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

  const exportarPDF = () => {
    setGenerandoPDF(true);
    try {
      const doc = new jsPDF();
      const fecha = new Date().toLocaleString("es-AR");
      doc.setFontSize(14);
      doc.text("Reporte de Bandeja - Dirección Provincial del Agua", 14, 15);
      doc.setFontSize(10);
      doc.text(`Fecha: ${fecha}`, 14, 22);
      const columns = [
        { header: "N° Expediente", dataKey: "numero" },
        { header: "Tipo", dataKey: "tipo" },
        { header: "Descripción", dataKey: "descripcion" },
        { header: "Estado", dataKey: "estado" },
        { header: "Fecha Pase", dataKey: "fecha_pase" },
        { header: "Origen", dataKey: "origen" },
      ];
      const rows = expedientesPendientes.map(e => ({
        numero: e.numero_expediente ?? "",
        tipo: e.tipo_tramite ?? e.tipo_expediente ?? "",
        descripcion: e.descripcion ?? "",
        estado: e.estado ?? e.estado_actual ?? "",
        fecha_pase: e.fecha_pase ? new Date(e.fecha_pase).toLocaleDateString("es-AR") : "",
        origen: e.desde_usuario ?? e.desde_departamento ?? "",
      }));
      autoTable(doc, { columns, body: rows, startY: 28 });
      return doc.output('bloburl');
    } catch (err) {
      alert(`No se pudo generar el reporte: ${err?.message ?? err}`);
      return null;
    } finally {
      setGenerandoPDF(false);
    }
  };

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
                      Number(h.id_usuario_responsable) === Number(usuarioLogueado.id_usuario) && 
                      h.accion?.toLowerCase().includes('recepci')
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
      cargarObservaciones(expediente.id_expediente);
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
        prioridad: expedienteRevision.prioridad || "media",
        estado_actual: nuevoEstado,
        comentario_director: comentarioDecision
      };
      
      // Enviamos al backend
      await axios.put(`${URL_EXPEDIENTES}/${expedienteRevision.id_expediente}`, payloadUpdate);

      // Actualización optimista: sacar inmediatamente del panel Resolver sin esperar el reload
      setExpedientesPendientes(prev =>
        prev.filter(e => e.id_expediente !== expedienteRevision.id_expediente)
      );

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
        comentario: comentarioDecision,
        tipo_accion: "decision_director"
      };
      

      await axios.post(URL_HISTORIAL, historialData);

      // Notificar al presentante por email
      try {
        await axios.post("http://localhost:8000/api/notificar-pase", {
          id_usuario: expedienteRevision.id_usuario_presentante,
          email: expedienteRevision.usuario_presentante_email || "",
          nombre: expedienteRevision.usuario_presentante_nombre || "",
          apellido: expedienteRevision.usuario_presentante_apellido || "",
          numero_expediente: expedienteRevision.numero_expediente,
          observacion: decisionTipo === "aprobar"
            ? `Su expediente fue APROBADO por la Dirección. ${comentarioDecision}`
            : `Su expediente fue RECHAZADO por la Dirección. ${comentarioDecision}`
        });
      } catch (notifErr) {
        console.warn("No se pudo enviar notificación al presentante:", notifErr.message);
        // No cortamos el flujo si falla la notificación
      }
      
      setMensajeRevision({
        tipo: "success",
        texto: `Expediente ${decisionTipo === "aprobar" ? "aprobado" : "rechazado"} exitosamente. Se notificará al usuario presentante.`
      });

      setTimeout(() => {
        cerrarModalRevision();
        // Recargar expedientes de consulta (todos)
        axios.get(URL_EXPEDIENTES)
          .then(res => setExpedientesTodos(res.data || []))
          .catch(() => {});
        // Recargar expedientes de bandeja/resolver
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
                      Number(h.id_usuario_responsable) === Number(usuarioLogueado.id_usuario) && 
                      (h.tipo_accion === 'revisión' || h.accion?.toLowerCase().includes('recepci'))
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

  const abrirModalDoc = (expediente, soloVer = false) => {
    setExpedienteDoc(expediente);
    setShowModalDoc(true);
    setModalSoloVer(soloVer);
    setArchivosStaged([]);
    setComentarioDoc("");
    setMensajeDoc({ tipo: "", texto: "" });
    setLoadingDocs(true);
    setHistorialDoc([]);
    setObservacionDirector(""); // Reset de observación para el nuevo expediente
    axios.get(`${URL_DOCUMENTOS}/expediente/${expediente.id_expediente}`)
      .then(res => setDocumentosDoc(res.data || []))
      .catch(err => console.error('Error al cargar documentos:', err))
      .finally(() => {
        setLoadingDocs(false);
        cargarObservaciones(expediente.id_expediente);
      });
    axios.get(`${URL_HISTORIAL}/${expediente.id_expediente}`)
      .then(res => setHistorialDoc(res.data || []))
      .catch(err => console.error('Error al cargar historial para docs:', err));
  };

  const cerrarModalDoc = () => {
    setShowModalDoc(false);
    setExpedienteDoc(null);
    setArchivosStaged([]);
    setComentarioDoc("");
    setMensajeDoc({ tipo: "", texto: "" });
    setDocumentosDoc([]);
    setHistorialDoc([]);
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

  const renderContenido = () => {
    switch (seccionActiva) {
      case "bandeja": {
        const expBandeja = expedientesPendientes.filter(exp =>
          !['aprobado', 'rechazado'].includes((exp.estado || exp.estado_actual || '').toLowerCase())
        );
        const totalPagBandeja = Math.max(1, Math.ceil(expBandeja.length / 6));
        const expPagBand = expBandeja.slice((paginaBandeja - 1) * 6, paginaBandeja * 6);
        return (
          <div className="seccion-contenido seccion-inicio">
            <h1>Portal del Director</h1>
            <p>Bienvenido al sistema de gestión de expedientes - Dirección Provincial del Agua</p>
            {loadingExpedientes ? <p>Cargando expedientes...</p> : expBandeja.length > 0 ? (
              <div className="expedientes-pendientes">
                <h2>Bandeja de Entrada - Expedientes asignados</h2>
                <div className="acciones-seleccion">
                  <Button variant="primary" onClick={abrirModalRecepcion} disabled={expedientesSeleccionados.length === 0}>
                    Recepcionar Seleccionados ({expedientesSeleccionados.length})
                  </Button>
                  <Button variant="outline-secondary" onClick={toggleSeleccionTodos} disabled={expBandeja.filter(e => !e.recepcionado).length === 0}>
                    {expedientesSeleccionados.length === expBandeja.filter(e => !e.recepcionado).length && expBandeja.filter(e => !e.recepcionado).length > 0 ? "Deseleccionar Todos" : "Seleccionar Todos"}
                  </Button>
                </div>
                <div className="paginacion mb-2">
                  <button className="cpag-btn" disabled={paginaBandeja === 1} onClick={() => setPaginaBandeja(p => p - 1)}>‹</button>
                  {Array.from({length: totalPagBandeja}, (_, i) => (
                    <button key={i+1} className={`cpag-btn${paginaBandeja === i+1 ? ' cpag-active' : ''}`} onClick={() => setPaginaBandeja(i+1)}>{i+1}</button>
                  ))}
                  <button className="cpag-btn" disabled={paginaBandeja === totalPagBandeja} onClick={() => setPaginaBandeja(p => p + 1)}>›</button>
                  <span className="cpag-info">{expBandeja.length} expediente(s)</span>
                </div>
                <div className="tabla-container">
                  <table className="tabla-expedientes">
                    <thead>
                      <tr>
                        <th><input type="checkbox" checked={expBandeja.filter(e => !e.recepcionado).length > 0 && expedientesSeleccionados.length === expBandeja.filter(e => !e.recepcionado).length} onChange={toggleSeleccionTodos} disabled={expBandeja.filter(e => !e.recepcionado).length === 0} /></th>
                        <th>Nº Expediente</th>
                        <th>Tipo</th>
                        <th>Descripción</th>
                        <th>Nombre</th>
                        <th>Fecha Pase</th>
                        <th>Documentación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expPagBand.map(exp => (
                        <tr key={exp.id_expediente} style={{ opacity: exp.recepcionado ? 0.6 : 1 }}>
                          <td><input type="checkbox" checked={expedientesSeleccionados.includes(exp.id_expediente)} onChange={() => toggleSeleccion(exp.id_expediente)} disabled={exp.recepcionado} /></td>
                          <td>
                            <strong>{exp.numero_expediente}</strong>
                            {exp.recepcionado && <span className="badge bg-success ms-2">✓ Recepcionado</span>}
                          </td>
                          <td>{exp.tipo_tramite || exp.tipo_expediente || '-'}</td>
                          <td className="descripcion-cell">{exp.descripcion || '-'}</td>
                          <td>{exp.usuario_presentante_nombre ? `${exp.usuario_presentante_nombre} ${exp.usuario_presentante_apellido}` : 'N/A'}</td>
                          <td>{exp.fecha_pase ? new Date(exp.fecha_pase).toLocaleDateString('es-AR') : '-'}</td>
                          <td><button className="btn btn-sm btn-info" onClick={() => abrirModalDoc(exp, true)}>📄 Ver Documentos</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="sin-expedientes"><p>No hay expedientes pendientes de recepción</p></div>
            )}
          </div>
        );
      }
      case "resolver":
        return (
          <div className="seccion-contenido seccion-inicio">
            <h1>Portal del Director</h1>
            <p>Bienvenido al sistema de gestión de expedientes - Dirección Provincial del Agua</p>
            
            {loadingExpedientes ? (
              <p>Cargando expedientes...</p>
            ) : expedientesPendientes.length > 0 ? (
              (() => {
                // Filtrar para que solo aparezcan los que NO están aprobados ni rechazados
                const pendientesRealmente = expedientesPendientes.filter(exp => 
                  !['aprobado', 'rechazado'].includes((exp.estado || exp.estado_actual || '').toLowerCase())
                );

                if (pendientesRealmente.length === 0) {
                  return (
                    <div className="sin-expedientes">
                      <p>No hay expedientes pendientes de revisión</p>
                    </div>
                  );
                }

                const totalPaginasBandeja = Math.max(1, Math.ceil(pendientesRealmente.length / 6));
                const expPagBandeja = pendientesRealmente.slice((paginaBandeja - 1) * 6, paginaBandeja * 6);
                return (
              <div className="expedientes-pendientes">
                <h2>Expedientes Pendientes de Revisión</h2>
                <div className="paginacion mb-2">
                  <button className="cpag-btn" disabled={paginaBandeja === 1} onClick={() => setPaginaBandeja(p => p - 1)}>‹</button>
                  {Array.from({length: totalPaginasBandeja}, (_, i) => (
                    <button key={i+1} className={`cpag-btn${paginaBandeja === i+1 ? ' cpag-active' : ''}`} onClick={() => setPaginaBandeja(i+1)}>{i+1}</button>
                  ))}
                  <button className="cpag-btn" disabled={paginaBandeja === totalPaginasBandeja} onClick={() => setPaginaBandeja(p => p + 1)}>›</button>
                  <span className="cpag-info">{pendientesRealmente.length} expediente(s)</span>
                </div>
                <div className="tabla-container">
                  <table className="tabla-expedientes">
                    <thead>
                      <tr>
                        <th>Nº Expediente</th>
                        <th>Tipo</th>
                        <th>Descripción</th>
                        <th>Nombre</th>
                        <th>Fecha Pase</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expPagBandeja.map(exp => (
                        <tr key={exp.id_expediente}>
                          <td>
                            <strong>{exp.numero_expediente}</strong>
                          </td>
                          <td>{exp.tipo_tramite || exp.tipo_expediente || '-'}</td>
                          <td className="descripcion-cell">{exp.descripcion || '-'}</td>
                          <td>{exp.usuario_presentante_nombre ? `${exp.usuario_presentante_nombre} ${exp.usuario_presentante_apellido}` : 'N/A'}</td>
                          <td>{exp.fecha_pase ? new Date(exp.fecha_pase).toLocaleDateString('es-AR') : '-'}</td>
                          <td>
                            <div className="d-flex gap-1 justify-content-center">
                              <button
                                className="btn btn-sm"
                                style={{ background: '#f1f3f5', border: '1px solid #ced4da', color: '#495057', fontWeight: 500, fontSize: '0.78rem', borderRadius: '6px', padding: '3px 10px' }}
                                onClick={() => abrirModalDoc(exp, true)}
                                title="Ver documentación del expediente"
                              >
                                Ver docs
                              </button>
                              <button
                                className="btn btn-sm"
                                style={{ background: '#0d6efd', border: 'none', color: '#fff', fontWeight: 500, fontSize: '0.875rem', borderRadius: '6px', padding: '3px 10px' }}
                                onClick={() => abrirModalRevisionCompleto(exp)}
                                title="Revisar expediente completo"
                              >
                                Resolución
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
                );
              })()
            ) : (
              <div className="sin-expedientes">
                <p>No hay expedientes pendientes de revisión</p>
              </div>
            )}
          </div>
        );

      case "consultar-expediente": {
        const recargarTodos = () => {
          setLoadingTodos(true);
          const params = {};
          if (fechaDesde) params.desde = fechaDesde;
          if (fechaHasta) params.hasta = fechaHasta;
          axios.get(URL_EXPEDIENTES, { params })
            .then(res => setExpedientesTodos(res.data || []))
            .catch(() => setExpedientesTodos([]))
            .finally(() => setLoadingTodos(false));
        };
        const expedientesFiltrados = expedientesTodos.filter(exp => {
          const texto = `${exp.numero_expediente} ${exp.estado_actual} ${exp.descripcion} ${exp.usuario_asignado_nombre || ''} ${exp.usuario_asignado_apellido || ''}`.toLowerCase();
          return texto.includes(filtroConsulta.toLowerCase());
        });
        const totalPaginasConsulta = Math.max(1, Math.ceil(expedientesFiltrados.length / 6));
        const expPagConsulta = expedientesFiltrados.slice((paginaConsulta - 1) * 6, paginaConsulta * 6);
        return (
          <div className="seccion-contenido seccion-consulta">
            <h2>Consulta de Expedientes</h2>
            <div className="consulta-toolbar mb-3">
              <div className="consulta-search-wrap">
                <span className="consulta-search-icon">🔍</span>
                <input
                  className="consulta-search-input"
                  type="text"
                  placeholder="Buscar por número, estado o usuario…"
                  value={filtroConsulta}
                  onChange={e => { setFiltroConsulta(e.target.value); setPaginaConsulta(1); }}
                  disabled={loadingTodos}
                />
              </div>

              {/* Filtro por rango de fechas */}
              <div style={{ position: "relative", display: "inline-block" }}>
                <button
                  onClick={() => setMostrarPickerFecha(v => !v)}
                  title={(fechaDesde || fechaHasta) ? `${fechaDesde || ""} — ${fechaHasta || ""}` : "Filtrar por fecha"}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    background: (fechaDesde || fechaHasta) ? "#2563eb" : "#f3f4f6",
                    color: (fechaDesde || fechaHasta) ? "#fff" : "#374151",
                    border: "1px solid #d1d5db", borderRadius: "7px",
                    height: "34px", padding: "0 12px", fontSize: "1rem", cursor: "pointer",
                  }}
                >
                  📅
                  {(fechaDesde || fechaHasta) && (
                    <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>{fechaDesde || "…"} — {fechaHasta || "…"}</span>
                  )}
                </button>
                {mostrarPickerFecha && (
                  <div style={{
                    position: "absolute", top: "40px", left: 0, zIndex: 9999,
                    background: "#fff", borderRadius: "12px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                    padding: "16px 20px", minWidth: "260px", border: "1px solid #e5e7eb",
                  }}>
                    <p style={{ margin: "0 0 10px", fontWeight: 700, color: "#1e3a5f", fontSize: "0.9rem" }}>Rango de fechas</p>
                    <div style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", fontSize: "0.78rem", color: "#6b7280", marginBottom: "4px", fontWeight: 600 }}>Desde</label>
                      <input type="date" value={fechaDesde} max={fechaHasta || undefined}
                        onChange={(e) => setFechaDesde(e.target.value)}
                        style={{ width: "100%", borderRadius: "6px", border: "1px solid #d1d5db", padding: "5px 8px", fontSize: "0.88rem" }} />
                    </div>
                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ display: "block", fontSize: "0.78rem", color: "#6b7280", marginBottom: "4px", fontWeight: 600 }}>Hasta</label>
                      <input type="date" value={fechaHasta} min={fechaDesde || undefined}
                        onChange={(e) => setFechaHasta(e.target.value)}
                        style={{ width: "100%", borderRadius: "6px", border: "1px solid #d1d5db", padding: "5px 8px", fontSize: "0.88rem" }} />
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => { setFechaDesde(""); setFechaHasta(""); }}
                        style={{ flex: 1, padding: "6px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#f9fafb", fontSize: "0.82rem", cursor: "pointer", fontWeight: 600, color: "#6b7280" }}>
                        Limpiar</button>
                      <button onClick={() => { recargarTodos(); setMostrarPickerFecha(false); }}
                        style={{ flex: 1, padding: "6px", borderRadius: "6px", border: "none", background: "#2563eb", color: "#fff", fontSize: "0.82rem", cursor: "pointer", fontWeight: 600 }}>
                        Aplicar</button>
                    </div>
                  </div>
                )}
              </div>

              {!loadingTodos && (
                <div className="consulta-pag">
                  <button className="cpag-btn" disabled={paginaConsulta === 1} onClick={() => setPaginaConsulta(p => p - 1)}>‹</button>
                  {Array.from({length: totalPaginasConsulta}, (_, i) => (
                    <button key={i+1} className={`cpag-btn${paginaConsulta === i+1 ? ' cpag-active' : ''}`} onClick={() => setPaginaConsulta(i+1)}>{i+1}</button>
                  ))}
                  <button className="cpag-btn" disabled={paginaConsulta === totalPaginasConsulta} onClick={() => setPaginaConsulta(p => p + 1)}>›</button>
                  <span className="cpag-info">{expedientesFiltrados.length} resultados</span>
                </div>
              )}
            </div>
            {loadingTodos ? (
              <p>Cargando expedientes...</p>
            ) : (
              <>
                <div className="tabla-container">
                  <table className="table table-sm table-bordered">
                    <thead>
                      <tr>
                        <th>Nº Expediente</th>
                        <th>Presentante</th>
                        <th>Tipo</th>
                        <th>Descripción</th>
                        <th>Prioridad</th>
                        <th>Ubicación</th>
                        <th>Estado</th>
                        <th>Asignado a</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expPagConsulta.map(exp => {
                        let usuarioAsignado = 'Sin asignar';
                        if (exp.usuario_asignado_nombre) {
                          usuarioAsignado = `${exp.usuario_asignado_nombre} ${exp.usuario_asignado_apellido}`;
                        }
                        if (!exp.usuario_asignado_nombre && exp.estado_actual === 'en revisión') {
                          usuarioAsignado = 'Pendiente de recepción';
                        }
                        return (
                          <tr key={exp.id_expediente}>
                            <td>{exp.numero_expediente}</td>
                            <td>{exp.usuario_presentante_nombre ? `${exp.usuario_presentante_nombre} ${exp.usuario_presentante_apellido}` : 'N/A'}</td>
                            <td>{exp.tipo_expediente || 'N/A'}</td>
                            <td>{exp.descripcion || 'N/A'}</td>
                            <td>{exp.prioridad || 'N/A'}</td>
                            <td>{exp.ubicacion || 'N/A'}</td>
                            <td>
                              {(() => {
                                const estado = (exp.estado_actual || exp.estado || '').toLowerCase();
                                if (estado === 'aprobado') return <span className="badge bg-success">Aprobado</span>;
                                if (estado === 'rechazado') return <span className="badge bg-danger">Rechazado</span>;
                                if (estado.includes('revisi')) return <span className="badge bg-warning text-dark">En revisión</span>;
                                return <span className="badge bg-secondary">{exp.estado_actual || exp.estado || 'Sin estado'}</span>;
                              })()}
                            </td>
                            <td>{usuarioAsignado}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {expedientesFiltrados.length === 0 && <p>No se encontraron expedientes.</p>}
                </div>
              </>
            )}
          </div>
        );
      }

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
            <h2>📖 Manual de Usuario</h2>
            <iframe
              src="/Manual_Usuario_SIGEDEX.pdf"
              title="Manual de Usuario"
              style={{ width: "100%", height: "80vh", border: "none", borderRadius: "8px" }}
            />
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
      {/* Navegación horizontal */}
      <div className="user-nav-bar user-nav-director">
        <Nav variant="pills" className="flex-wrap gap-1 align-items-center">
          <Nav.Item>
            <Nav.Link active={seccionActiva === "bandeja"} onClick={() => setSeccionActiva("bandeja")}>📥 Bandeja</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={["inicio","resolver"].includes(seccionActiva)} onClick={() => setSeccionActiva("resolver")}>⚖️ Resolver</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={seccionActiva === "consultar-expediente"} onClick={() => setSeccionActiva("consultar-expediente")}>�️ Consulta</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <button
              className="nav-reporte-btn"
              onClick={() => { const url = exportarPDF(); if (url) setNavPreviewUrl(url); }}
              disabled={generandoPDF}
            >
              {generandoPDF ? "⏳ Generando..." : "🖨️ Reporte"}
            </button>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={seccionActiva === "manual-usuario"} onClick={() => setSeccionActiva("manual-usuario")}>📖 Manual</Nav.Link>
          </Nav.Item>
        </Nav>
      </div>

      {/* Vista previa PDF */}
      {navPreviewUrl && (
        <div className="pdf-preview-overlay" onClick={e => { if (e.target === e.currentTarget) setNavPreviewUrl(null); }}>
          <div className="pdf-preview-modal">
            <div className="pdf-preview-header">
              <span className="pdf-preview-title">📄 Vista previa del reporte</span>
              <div className="pdf-preview-actions">
                <a href={navPreviewUrl} download="reporte.pdf" className="pdf-btn pdf-btn-download">&#8595; Descargar</a>
                <button className="pdf-btn pdf-btn-close" onClick={() => setNavPreviewUrl(null)}>✕ Cerrar</button>
              </div>
            </div>
            <iframe src={navPreviewUrl} className="pdf-preview-frame" title="Vista previa reporte" />
          </div>
        </div>
      )}

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
                            <td>{h.fecha ? new Date(h.fecha).toLocaleString('es-AR') : '-'}</td>
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
        <Modal.Header closeButton style={{ borderBottom: '2px solid #dee2e6' }}>
          <Modal.Title style={{ fontWeight: 600, fontSize: '1.1rem' }}>
            📁 Expediente {expedienteDoc?.numero_expediente}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '1rem 1.5rem' }}>

          {/* Datos del presentante */}
          {expedienteDoc && (
            <div className="mb-2 p-2" style={{ background: '#f0f4ff', borderRadius: '8px', border: '1px solid #c7d4f0' }}>
              <p className="mb-1 fw-semibold text-primary" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Datos del presentante</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px', fontSize: '0.9rem', color: '#333' }}>
                <span><span className="text-muted">Nombre:</span> <strong>{expedienteDoc.usuario_presentante_nombre} {expedienteDoc.usuario_presentante_apellido}</strong></span>
                <span><span className="text-muted">Teléfono:</span> <strong>{expedienteDoc.usuario_presentante_telefono || '—'}</strong></span>
                <span><span className="text-muted">Email:</span> <strong>{expedienteDoc.usuario_presentante_email || '—'}</strong></span>
              </div>
            </div>
          )}

          {/* Alerta de resultado */}
          {mensajeDoc.tipo && mensajeDoc.texto && (
            <Alert variant={mensajeDoc.tipo} className="py-2">{mensajeDoc.texto}</Alert>
          )}

          {/* Sección: subir archivos (solo modo completo) */}
          {!modalSoloVer && (
            <div className="mb-2 p-2" style={{ background: '#fff', borderRadius: '8px', border: '1px solid #dee2e6' }}>
              <p className="mb-2 fw-semibold" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#555' }}>Subir documentación oficial</p>
              <Form.Control type="file" multiple onChange={(e) => setArchivosStaged(Array.from(e.target.files))} disabled={subiendoDoc} className="mb-2" />
              {archivosStaged.length > 0 && <Form.Text className="text-muted d-block mb-2">{archivosStaged.length} archivo(s) seleccionado(s)</Form.Text>}
              <Form.Control as="textarea" rows={2} placeholder="Comentario de Dirección (opcional)..." value={comentarioDoc} onChange={(e) => setComentarioDoc(e.target.value)} disabled={subiendoDoc} className="mb-2" />
              <Button size="sm" variant="primary" disabled={archivosStaged.length === 0 || subiendoDoc}
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
                    const msg = fail === 0 ? `Se subieron ${ok} archivo(s)` : `Subidos ${ok}, fallidos ${fail}`;
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
            </div>
          )}

          {/* Sección: documentos existentes agrupados por rol */}
          {loadingDocs ? (
            <p className="text-muted text-center py-3">Cargando documentos…</p>
          ) : (() => {
            const rolOrder = ['Presentante', 'Administrativo', 'Técnico', 'Jurídico'];
            const grupos = {};
            rolOrder.forEach(r => { grupos[r] = []; });
            documentosDoc.forEach(doc => {
              const rol = doc.rol_nombre || 'Otro';
              if (grupos[rol]) grupos[rol].push(doc);
              else { grupos[rol] = [doc]; }
            });
            const nombresPorRol = {};
            historialDoc.forEach(h => {
              if ((h.rol_nombre === 'Administrativo' || h.rol_nombre === 'Técnico' || h.rol_nombre === 'Jurídico') && !nombresPorRol[h.rol_nombre]) {
                nombresPorRol[h.rol_nombre] = `${h.usuario_nombre || ''} ${h.usuario_apellido || ''}`.trim();
              }
            });
            // También obtener nombres desde los propios documentos
            documentosDoc.forEach(doc => {
              if ((doc.rol_nombre === 'Administrativo' || doc.rol_nombre === 'Técnico' || doc.rol_nombre === 'Jurídico') && !nombresPorRol[doc.rol_nombre] && doc.subido_por_nombre) {
                nombresPorRol[doc.rol_nombre] = doc.subido_por_nombre;
              }
            });
            const hayAlgun = rolOrder.some(r => grupos[r].length > 0);
            if (!hayAlgun && !modalSoloVer) return (
              <p className="text-muted text-center py-3" style={{ fontSize: '0.9rem' }}>No hay documentos adjuntos para este expediente.</p>
            );
            return (
              <div>
                <p className="mb-2 fw-semibold text-primary" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Documentación adjunta</p>
                {rolOrder.map(rol => {
                  const docs = grupos[rol] || [];
                  if (rol === 'Presentante' && docs.length === 0) return null;
                  return (
                    <div key={rol} className="mb-2">
                      <h6 className="fw-bold" style={{ color: '#495057' }}>
                        {rol === 'Presentante' ? '👤' : rol === 'Administrativo' ? '📂' : rol === 'Técnico' ? '🔧' : '⚖️'} {rol}
                        {nombresPorRol[rol] && (
                          <span className="fw-normal text-muted ms-2" style={{ fontSize: '0.85rem' }}>— {nombresPorRol[rol]}</span>
                        )}
                      </h6>
                      {docs.length > 0 ? (
                        <table className="table table-sm table-hover align-middle" style={{ fontSize: '0.875rem' }}>
                          <thead className="table-light">
                            <tr><th>Nombre</th><th>Tipo</th><th>Tamaño</th><th>Fecha</th><th></th></tr>
                          </thead>
                          <tbody>
                            {docs.map(doc => (
                              <tr key={doc.id_documento}>
                                <td title={doc.nombre_archivo} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.nombre_archivo}</td>
                                <td>{doc.tipo}</td>
                                <td>{Math.round((doc.tamaño_archivo || 0) / 1024)} KB</td>
                                <td>{doc.fecha_subida ? new Date(doc.fecha_subida).toLocaleDateString("es-AR") : '—'}</td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <a href={`${URL_DOCUMENTOS}/ver/${doc.id_documento}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">Ver</a>
                                    {!modalSoloVer && (
                                      <>
                                        <button className="btn btn-outline-success btn-sm" onClick={() => abrirModalFirma(doc)} title="Firmar documento">✍️</button>
                                        <button className="btn btn-outline-danger btn-sm" onClick={async () => {
                                          if (!window.confirm('¿Eliminar este documento?')) return;
                                          try {
                                            await axios.delete(`${URL_DOCUMENTOS}/${doc.id_documento}`);
                                            const resp = await axios.get(`${URL_DOCUMENTOS}/expediente/${expedienteDoc.id_expediente}`);
                                            setDocumentosDoc(resp.data || []);
                                          } catch (err) {
                                            console.error('Error al eliminar documento:', err);
                                            setMensajeDoc({ tipo: 'danger', texto: err.response?.data?.error || 'No se pudo eliminar el documento' });
                                          }
                                        }} title="Eliminar documento">🗑️</button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-muted small ms-2">Sin documentos adjuntos</p>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}


        </Modal.Body>
      </Modal>    

      {/* Modal de Revisión Completo (Nuevo) */}
      <Modal show={showModalRevision} onHide={cerrarModalRevision} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Revisión Completa - Expediente {expedienteRevision?.numero_expediente}
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
              <div className="mb-4 p-3" style={{ background: '#f0f4ff', borderRadius: '8px', border: '1px solid #c7d4f0' }}>
                <p className="mb-3 fw-semibold text-primary" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Información del Expediente</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: '0.9rem', color: '#333' }}>
                  <span><span className="text-muted">Número:</span> <strong>{expedienteRevision.numero_expediente}</strong></span>
                  <span><span className="text-muted">Presentante:</span> <strong>{expedienteRevision.usuario_presentante_nombre} {expedienteRevision.usuario_presentante_apellido}</strong></span>
                  <span><span className="text-muted">Teléfono:</span> <strong>{expedienteRevision.usuario_presentante_telefono || '—'}</strong></span>
                  <span><span className="text-muted">Tipo:</span> <strong>{expedienteRevision.tipo_tramite || expedienteRevision.tipo_expediente}</strong></span>
                  <span style={{ gridColumn: '1 / -1' }}><span className="text-muted">Descripción:</span> <strong>{expedienteRevision.descripcion || 'Sin descripción'}</strong></span>
                  <span><span className="text-muted">Prioridad:</span> <span className={`badge badge-${expedienteRevision.prioridad}`}>{expedienteRevision.prioridad || 'normal'}</span></span>
                  <span><span className="text-muted">Ubicación:</span> <strong>{expedienteRevision.ubicacion || 'Sin especificar'}</strong></span>
                </div>
              </div>

              {/* Documentos Existentes */}
              <div className="mb-4">
                <p className="mb-2 fw-semibold text-primary" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Documentación adjunta</p>
                {loadingDocsRevision ? (
                  <p>Cargando documentos...</p>
                ) : documentosRevision.length > 0 ? (
                  (() => {
                    const rolOrder = ['Presentante', 'Administrativo', 'Técnico', 'Jurídico'];
                    const grupos = {};
                    rolOrder.forEach(r => { grupos[r] = []; });
                    documentosRevision.forEach(doc => {
                      const rol = doc.rol_nombre || 'Otro';
                      if (grupos[rol]) grupos[rol].push(doc);
                      else { grupos[rol] = grupos[rol] || []; grupos[rol].push(doc); }
                    });
                    // Buscar nombres en el historial
                    const nombresPorRol = {};
                    historialRevision.forEach(h => {
                      if ((h.rol_nombre === 'Administrativo' || h.rol_nombre === 'Técnico' || h.rol_nombre === 'Jurídico') && !nombresPorRol[h.rol_nombre]) {
                        nombresPorRol[h.rol_nombre] = `${h.usuario_nombre || ''} ${h.usuario_apellido || ''}`.trim();
                      }
                    });
                    return (
                      <div>
                        {rolOrder.map(rol => {
                          const docs = grupos[rol] || [];
                          // Presentante: solo mostrar si tiene docs
                          if (rol === 'Presentante' && docs.length === 0) return null;
                          const obsRol = observacionesExps.filter(o => o.rol === rol);
                          return (
                            <div key={rol} className="mb-3">
                              <h6 className="fw-bold" style={{ color: '#495057' }}>
                                {rol === 'Presentante' ? '👤' : rol === 'Administrativo' ? '📂' : rol === 'Técnico' ? '🔧' : '⚖️'} {rol}
                                {nombresPorRol[rol] && (
                                  <span className="fw-normal text-muted ms-2" style={{ fontSize: '0.85rem' }}>
                                    — {nombresPorRol[rol]}
                                  </span>
                                )}
                              </h6>
                              {docs.length > 0 ? (
                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                  <table className="table table-sm table-hover align-middle" style={{ fontSize: '0.875rem' }}>
                                    <thead className="table-light">
                                      <tr>
                                        <th>Nombre</th>
                                        <th>Tipo</th>
                                        <th>Tamaño</th>
                                        <th>Fecha</th>
                                        <th></th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {docs.map(doc => (
                                        <tr key={doc.id_documento}>
                                          <td title={doc.nombre_archivo} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.nombre_archivo}</td>
                                          <td>{doc.tipo}</td>
                                          <td>{Math.round((doc.tamaño_archivo || 0) / 1024)} KB</td>
                                          <td>{doc.fecha_subida ? new Date(doc.fecha_subida).toLocaleDateString('es-AR') : '—'}</td>
                                          <td>
                                            <a href={`${URL_DOCUMENTOS}/ver/${doc.id_documento}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">Ver</a>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="text-muted small ms-2">Sin documentos adjuntos</p>
                              )}
                              {obsRol.length > 0 && (
                                <div className="ms-2 mt-1 p-2" style={{ background: '#f8f9fa', borderLeft: '3px solid #6c757d', borderRadius: '4px' }}>
                                  <span className="fw-semibold" style={{ fontSize: '0.8rem', color: '#555' }}>Observaciones:</span>
                                  {obsRol.map((obs, i) => (
                                    <div key={i} style={{ fontSize: '0.85rem', color: '#333', marginTop: '2px' }}>{obs.observacion}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                ) : (
                  <Alert variant="info">No hay documentos adjuntos en este expediente</Alert>
                )}
              </div>

              {/* Historial de Movimientos */}
              <div className="mb-4">
                <h5 className="text-primary">Historial de Movimientos</h5>
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
                            <td>{h.fecha ? new Date(h.fecha).toLocaleString('es-AR') : '-'}</td>
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

              {/* Subir Nuevos Documentos */}
              <div className="mb-4">
                <h5 className="text-success">Subir Documentos Oficiales (Opcional)</h5>
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

                <Button 
                  variant="outline-success"
                  onClick={subirDocumentosRevision}
                  disabled={archivosRevision.length === 0 || subiendoDoc || procesandoDecision}
                  className="me-2"
                >
                  {subiendoDoc ? 'Subiendo...' : 'Subir Documentos'}
                </Button>
              </div>

              <hr />

              {/* Decisión Final */}
              <div className="mb-3">
                <h5 className="text-danger">Decisión Final del Director</h5>
                <Alert variant="warning">
                  <strong>Importante:</strong> Esta decisión es definitiva y se notificará al usuario presentante del trámite.
                </Alert>

                <Form.Group className="mb-3">
                  <Form.Label><strong>Seleccione su decisión *</strong></Form.Label>
                  <div className="d-flex gap-3">
                    <Form.Check
                      type="radio"
                      id="radio-aprobar"
                      label="APROBAR"
                      name="decision"
                      checked={decisionTipo === 'aprobar'}
                      onChange={() => setDecisionTipo('aprobar')}
                      disabled={procesandoDecision}
                    />
                    <Form.Check
                      type="radio"
                      id="radio-rechazar"
                      label="RECHAZAR"
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
                ? 'Confirmar Aprobación' 
                : decisionTipo === 'rechazar'
                ? 'Confirmar Rechazo'
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
