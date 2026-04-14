import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { URL_ROLES, URL_EXPEDIENTES_PASES, URL_HISTORIAL, URL_EXPEDIENTES, URL_DOCUMENTOS,URL_OBSERVACIONES } from "../Constants/endpoints";
import { Modal, Button, Form, Alert, Nav } from "react-bootstrap";
import "../CSS/UsuarioTecnico.css";
import BotonesReporte from "./BotonesReporte";

export default function UsuarioTecnico() {
  const navigate = useNavigate();
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));
  const [seccionActiva, setSeccionActiva] = useState("bandeja");
  const [generandoPDF, setGenerandoPDF] = useState(false);
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
  // Estados para consulta general de expedientes
  const [expedientesTodos, setExpedientesTodos] = useState([]);
  const [filtroConsulta, setFiltroConsulta] = useState("");
  const [loadingTodos, setLoadingTodos] = useState(false);

  // Estados para subir documentación
  const [showModalDoc, setShowModalDoc] = useState(false);
  const [expedienteDoc, setExpedienteDoc] = useState(null);
  const [archivosStaged, setArchivosStaged] = useState([]);
  const [comentarioDoc, setComentarioDoc] = useState("");
  const [subiendoDoc, setSubiendoDoc] = useState(false);
  const [mensajeDoc, setMensajeDoc] = useState({ tipo: "", texto: "" });
  const [documentosDoc, setDocumentosDoc] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Hooks para modal Ver
  const [showModalVer, setShowModalVer] = useState(false);
  const [expedienteVer, setExpedienteVer] = useState(null);
  const [observacionVer, setObservacionVer] = useState("");
  const [archivosVer, setArchivosVer] = useState([]);
  const [subiendoVer, setSubiendoVer] = useState(false);
  const [mensajeVer, setMensajeVer] = useState({ tipo: "", texto: "" });
  const [destinatarioPase, setDestinatarioPase] = useState("");
  const [usuariosPase, setUsuariosPase] = useState([]);
  const [cargandoDestinatarios, setCargandoDestinatarios] = useState(null); 
  const [pasesPorExp, setPasesPorExp] = useState({}); // id_expediente -> true/false
  const [modalDeshacer, setModalDeshacer] = useState(null); // expediente para deshacer
  const [informeTecnico, setInformeTecnico] = useState("");

  //observaciones generales modal ver
  const [observacionTecnico, setObservacionTecnico] = useState("");
  const [errorObs, setErrorObs] = useState("");
  const [modalSoloVer, setModalSoloVer] = useState(false);
  const [observacionesExps, setObservacionesExps] = useState([]); // Histórico para el modal
  const [subiendoObs, setSubiendoObs] = useState(false); // Nuevo estado para bloqueo de botón

  const cargarObservaciones = async (idExp) => {
    try {
      const res = await axios.get(`${URL_OBSERVACIONES}/${idExp}`);
      const data = res.data || {};
      const todas = [
        ...(data.Técnico || []).map(o => ({ ...o, rol: 'Técnico' }))
      ].sort((a,b) => new Date(b.fecha_hora) - new Date(a.fecha_hora));
      setObservacionesExps(todas);
    } catch (err) {
      console.error("Error al cargar observaciones:", err);
    }
  };
  // Paginación (3 por página)
  const [paginaConsulta, setPaginaConsulta] = useState(1);
  const [paginaPase, setPaginaPase] = useState(1);
  const [paginaBandeja, setPaginaBandeja] = useState(1);

  // Vista previa PDF desde navbar
  const [navPreviewUrl, setNavPreviewUrl] = useState(null);

  useEffect(() => {
        // Cargar todos los expedientes para la consulta general
        setLoadingTodos(true);
        axios.get(URL_EXPEDIENTES)
          .then(res => setExpedientesTodos(res.data || []))
          .catch(() => setExpedientesTodos([]))
          .finally(() => setLoadingTodos(false));
    try {
      const user = usuarioLogueado;
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
      
      // Cargar expedientes iniciales
      recargarExpedientes();
    } catch {
      setLoading(false);
    }
  }, []);

  // Recargar expedientes (Unificado)
  const recargarExpedientes = () => {
    const idUsuario = usuarioLogueado?.id_usuario;
    if (!idUsuario) return;
    
    setLoadingExpedientes(true);
    // Traemos los asignados a mí Y todos los en revisión/asignados para buscar los que yo mandé
    Promise.all([
      axios.get(`${URL_EXPEDIENTES_PASES}/${idUsuario}`),
      axios.get(URL_EXPEDIENTES, { params: { estado: 'asignado' } })
    ]).then(async ([resAsignados, resAsignadosGral]) => {
        const listAsignados = resAsignados.data || [];
        const listGral = resAsignadosGral.data || [];
        
        // Unificamos (evitando duplicados)
        const mapUnico = new Map();
        listAsignados.forEach(e => mapUnico.set(e.id_expediente, e));
        listGral.forEach(e => mapUnico.set(e.id_expediente, e));
        
        const expedientes = Array.from(mapUnico.values());
        const mapaPases = {};

        const expedientesConEstado = await Promise.all(
          expedientes.map(async exp => {
            try {
              const historial = await axios.get(`${URL_HISTORIAL}/${exp.id_expediente}`);
              const historialData = historial.data || [];

              // Detectar si yo fui el último en realizar una asignación (reversible)
              const pasesReversibles = historialData.filter(h => 
                (h.tipo_accion ?? "").toLowerCase() === "asignación" ||
                (h.accion ?? "").toLowerCase().includes("pase")
              );
              const ultimoPase = pasesReversibles[0];
              const penultimoPase = pasesReversibles[1];

              // Es reversible si yo lo tenía antes y ahora lo tiene otro
              const esReversible = ultimoPase && 
                                  ultimoPase.id_usuario_responsable !== idUsuario && 
                                  penultimoPase && penultimoPase.id_usuario_responsable === idUsuario;

              mapaPases[exp.id_expediente] = !!esReversible;

              // Buscar si este usuario recepcionó el expediente
              const recepcionPorUsuario = historialData.find(h =>
                h.id_usuario_responsable === idUsuario &&
                h.accion?.toLowerCase().includes('recepción')
              );
              // Buscar la última recepción (cualquier usuario)
              const ultimaRecepcion = historialData
                .filter(h => h.accion?.toLowerCase().includes('recepción'))
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
              // El usuario puede hacer pase solo si él fue quien recepcionó
              const puedeHacerPase = ultimaRecepcion && ultimaRecepcion.id_usuario_responsable === idUsuario;

              // --- Datos del último pase/asignación a este usuario ---
              const historialAsc = [...historialData].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
              const ultimoAsignadoAUsuario = historialData
                .filter(h => h.id_usuario_responsable === idUsuario)
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];

              let fechaPase = exp.fecha_creacion;
              let observacionesPase = '';
              let desdeUsuario = '-';

              if (ultimoAsignadoAUsuario) {
                fechaPase = ultimoAsignadoAUsuario.fecha;
                observacionesPase = ultimoAsignadoAUsuario.comentario || '';
                const idxEnAsc = historialAsc.findIndex(h => h.id_historial === ultimoAsignadoAUsuario.id_historial);
                if (idxEnAsc > 0) {
                  const entradaAnterior = historialAsc[idxEnAsc - 1];
                  desdeUsuario = `${entradaAnterior.usuario_nombre || ''} ${entradaAnterior.usuario_apellido || ''}`.trim() || '-';
                }
              }

              return {
                ...exp,
                tipo: exp.tipo_expediente || exp.tipo_tramite || exp.tipo || 'N/A',
                descripcion: exp.descripcion || exp.detalle || '-',
                estado: exp.estado_actual || exp.estado || 'N/A',
                fecha_pase: fechaPase,
                desde_usuario: desdeUsuario,
                observaciones_pase: observacionesPase,
                recepcionado: !!recepcionPorUsuario,
                puedeHacerPase: puedeHacerPase,
                recepcionadoPor: ultimaRecepcion?.id_usuario_responsable
              };
            } catch {
              return { ...exp, tipo: exp.tipo_expediente || 'N/A', descripcion: '-', estado: exp.estado_actual || 'N/A', recepcionado: false, puedeHacerPase: false };
            }
          })
        );
        setPasesPorExp(mapaPases);
        setExpedientesPendientes(expedientesConEstado);
      })
      .catch(err => {
        console.error("Error al cargar expedientes con pase:", err);
      })
      .finally(() => setLoadingExpedientes(false));
  };

  const exportarPDF = () => {
    setGenerandoPDF(true);
    try {
      const doc = new jsPDF();
      const fecha = new Date().toLocaleString("es-AR");

      if (seccionActiva === "consultar-expediente") {
        // Reporte de la consulta filtrada actual
        const filtrados = expedientesTodos.filter(exp => {
          const texto = `${exp.numero_expediente} ${exp.estado_actual} ${exp.descripcion} ${exp.usuario_asignado_nombre || ''} ${exp.usuario_asignado_apellido || ''}`.toLowerCase();
          return texto.includes(filtroConsulta.toLowerCase());
        });
        doc.setFontSize(14);
        doc.text("Consulta de Expedientes - Área Técnica", 14, 15);
        doc.setFontSize(10);
        doc.text(`Fecha: ${fecha}${filtroConsulta ? `  |  Filtro: "${filtroConsulta}"` : ""}`, 14, 22);
        doc.text(`Total: ${filtrados.length} expediente(s)`, 14, 28);
        autoTable(doc, {
          startY: 33,
          columns: [
            { header: "Nº Expediente", dataKey: "numero" },
            { header: "Presentante", dataKey: "presentante" },
            { header: "Tipo", dataKey: "tipo" },
            { header: "Descripción", dataKey: "descripcion" },
            { header: "Prioridad", dataKey: "prioridad" },
            { header: "Ubicación", dataKey: "ubicacion" },
            { header: "Fecha", dataKey: "fecha" },
            { header: "Asignado a", dataKey: "asignado" },
          ],
          body: filtrados.map(e => ({
            numero: e.numero_expediente ?? "",
            presentante: e.usuario_presentante_nombre ? `${e.usuario_presentante_nombre} ${e.usuario_presentante_apellido}` : "N/A",
            tipo: e.tipo_expediente ?? "",
            descripcion: e.descripcion ?? "",
            prioridad: e.prioridad ?? "",
            ubicacion: e.ubicacion ?? "",
            fecha: e.fecha_creacion ? new Date(e.fecha_creacion).toLocaleDateString("es-AR") : "",
            asignado: e.usuario_asignado_nombre ? `${e.usuario_asignado_nombre} ${e.usuario_asignado_apellido}` : "Sin asignar",
          })),
        });

      } else if (seccionActiva === "realizar-pase") {
        // Reporte de expedientes disponibles para pase
        const expedientesRecepcionados = Array.from(
          new Map(
            expedientesPendientes
              .filter(exp => exp.recepcionado && exp.puedeHacerPase)
              .map(exp => [exp.id_expediente, exp])
          ).values()
        );
        doc.setFontSize(14);
        doc.text("Expedientes para Realizar Pase - Área Técnica", 14, 15);
        doc.setFontSize(10);
        doc.text(`Fecha: ${fecha}`, 14, 22);
        doc.text(`Total: ${expedientesRecepcionados.length} expediente(s)`, 14, 28);
        autoTable(doc, {
          startY: 33,
          columns: [
            { header: "Nº Expediente", dataKey: "numero" },
            { header: "Tipo", dataKey: "tipo" },
            { header: "Estado", dataKey: "estado" },
            { header: "Fecha Pase", dataKey: "fecha_pase" },
            { header: "Origen", dataKey: "origen" },
            { header: "Observaciones", dataKey: "obs" },
          ],
          body: expedientesRecepcionados.map(e => ({
            numero: e.numero_expediente ?? "",
            tipo: e.tipo_tramite ?? e.tipo_expediente ?? "",
            estado: e.estado ?? e.estado_actual ?? "",
            fecha_pase: e.fecha_pase ? new Date(e.fecha_pase).toLocaleDateString("es-AR") : "",
            origen: e.desde_usuario ?? e.desde_departamento ?? "",
            obs: e.observaciones_pase ?? "",
          })),
        });

      } else {
        // Bandeja de entrada (default)
        const expedientesUnicos = Array.from(
          new Map(expedientesPendientes.map(e => [e.id_expediente, e])).values()
        );
        doc.setFontSize(14);
        doc.text("Bandeja de Entrada - Área Técnica", 14, 15);
        doc.setFontSize(10);
        doc.text(`Fecha: ${fecha}`, 14, 22);
        doc.text(`Total: ${expedientesUnicos.length} expediente(s)`, 14, 28);
        autoTable(doc, {
          startY: 33,
          columns: [
            { header: "Nº Expediente", dataKey: "numero" },
            { header: "Tipo", dataKey: "tipo" },
            { header: "Estado", dataKey: "estado" },
            { header: "Fecha Pase", dataKey: "fecha_pase" },
            { header: "Origen", dataKey: "origen" },
            { header: "Observaciones", dataKey: "obs" },
          ],
          body: expedientesUnicos.map(e => ({
            numero: e.numero_expediente ?? "",
            tipo: e.tipo_tramite ?? e.tipo_expediente ?? "",
            estado: e.estado ?? e.estado_actual ?? "",
            fecha_pase: e.fecha_pase ? new Date(e.fecha_pase).toLocaleDateString("es-AR") : "",
            origen: e.desde_usuario ?? e.desde_departamento ?? "",
            obs: e.observaciones_pase ?? "",
          })),
        });
      }

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
          comentario: observacionesRecepcion || "Expediente recepcionado por área técnica"
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
                    const historialData = historial.data || [];

                    const recepcionPorUsuario = historialData.find(h =>
                      h.id_usuario_responsable === usuarioLogueado.id_usuario &&
                      h.accion?.toLowerCase().includes('recepción')
                    );

                    const ultimaRecepcion = historialData
                      .filter(h => h.accion?.toLowerCase().includes('recepción'))
                      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];

                    const puedeHacerPase = ultimaRecepcion && ultimaRecepcion.id_usuario_responsable === usuarioLogueado.id_usuario;

                    // --- Datos del último pase/asignación a este usuario ---
                    const historialAsc = [...historialData].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
                    const ultimoAsignadoAUsuario = historialData
                      .filter(h => h.id_usuario_responsable === usuarioLogueado.id_usuario)
                      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];

                    let fechaPase = exp.fecha_creacion;
                    let observacionesPase = '';
                    let desdeUsuario = '-';

                    if (ultimoAsignadoAUsuario) {
                      fechaPase = ultimoAsignadoAUsuario.fecha;
                      observacionesPase = ultimoAsignadoAUsuario.comentario || '';
                      const idxEnAsc = historialAsc.findIndex(h => h.id_historial === ultimoAsignadoAUsuario.id_historial);
                      if (idxEnAsc > 0) {
                        const entradaAnterior = historialAsc[idxEnAsc - 1];
                        desdeUsuario = `${entradaAnterior.usuario_nombre || ''} ${entradaAnterior.usuario_apellido || ''}`.trim() || '-';
                      }
                    }

                    return {
                      ...exp,
                      tipo_tramite: exp.tipo_expediente,
                      estado: exp.estado_actual,
                      fecha_pase: fechaPase,
                      desde_usuario: desdeUsuario,
                      observaciones_pase: observacionesPase,
                      recepcionado: !!recepcionPorUsuario,
                      puedeHacerPase: puedeHacerPase
                    };
                  } catch {
                    return {
                      ...exp,
                      tipo_tramite: exp.tipo_expediente,
                      estado: exp.estado_actual,
                      recepcionado: false,
                      puedeHacerPase: false
                    };
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

  const abrirModalDoc = (expediente, soloVer = false) => {
    setExpedienteDoc(expediente);
    setShowModalDoc(true);
    setModalSoloVer(soloVer);
    setArchivosStaged([]);
    setComentarioDoc("");
    setMensajeDoc({ tipo: "", texto: "" });
    setLoadingDocs(true);
    setObservacionTecnico(""); // Reset de observación para el nuevo expediente
    cargarObservaciones(expediente.id_expediente);
    axios.get(`${URL_DOCUMENTOS}/expediente/${expediente.id_expediente}`)
      .then(res => setDocumentosDoc(res.data || []))
      .catch(err => console.error('Error al cargar documentos:', err))
      .finally(() => setLoadingDocs(false));
  };

  const handleArchivosVer = (e) => {
    setArchivosVer(Array.from(e.target.files));
  };

  const realizarPaseModal = async () => {
    if (!destinatarioPase || !expedienteVer) return;
    setSubiendoVer(true);
    setMensajeVer({ tipo: '', texto: '' });
    try {
      // 1. Registrar el pase en el historial
      const resp = await axios.post('http://localhost:8000/historial', {
        id_expediente: expedienteVer.id_expediente ?? '',
        id_usuario_responsable: destinatarioPase ?? '',
        accion: 'Pase de expediente',
        comentario: observacionVer ?? '',
        tipo_accion: 'asignación',
        id_departamento: expedienteVer.id_departamento ?? null
      });
      console.log('Respuesta pase:', resp.data);
      if (resp.status !== 201) {
        setMensajeVer({ tipo: 'danger', texto: resp.data?.error || 'No se pudo realizar el pase.' });
        setSubiendoVer(false);
        return;
      }

      // 2. Actualizar el expediente con el nuevo usuario asignado
      await axios.put(`http://localhost:8000/expedientes/${expedienteVer.id_expediente}`, {
        id_profesional_asignado: destinatarioPase
      });

      setMensajeVer({ tipo: 'success', texto: 'Pase realizado con éxito.' });

      // 4. Subir documentos si corresponde (Restaurado)
      if (archivosVer.length > 0) {
        const formData = new FormData();
        archivosVer.forEach((file) => {
          formData.append('files', file);
        });
        formData.append('id_expediente', expedienteVer.id_expediente);
        formData.append('subido_por', usuarioLogueado.id_usuario);
        const respDoc = await axios.post('http://localhost:8000/api/documentos/subirYRegistrar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (respDoc.status !== 201) {
          setMensajeVer({ tipo: 'warning', texto: respDoc.data?.error || 'Pase realizado pero algunos documentos no se guardaron.' });
        }
      }

      setArchivosVer([]);
      setTimeout(() => {
        cerrarModalVer();
        recargarExpedientes();
      }, 1200);
    } catch (err) {
      console.error('Error pase:', err);
      setMensajeVer({ tipo: 'danger', texto: err.response?.data?.error || 'Error al realizar el pase o guardar documentos.' });
    }
    setSubiendoVer(false);
  };

  // Menú específico para Usuario Técnico
  const menuItems = [
    { id: "realizar-pase", label: "Realizar Pase", icon: "➤", permiso: "realizar_pase" },
    { id: "consultar-expediente", label: "Consultar Expediente", icon: "🔍", permiso: "consultar_expediente_detalle" },
    { id: "recepcion-pase", label: "Recepción", icon: "📥", permiso: "recepcion_pase" },
    { id: "analisis-tecnico", label: "Análisis Técnico", icon: "🔬", permiso: "analisis_tecnico" },
    { id: "informes-tecnicos", label: "Informes Técnicos", icon: "📋", permiso: "generar_informes" },
    { id: "manual-usuario", label: "Manual de Usuario", icon: "📖", permiso: "ver_manual_usuario" },
  ];

  const menuFiltrado = permisosUsuario.length > 0
    ? menuItems.filter(m => permisosUsuario.includes(m.permiso))
    : menuItems;

  const renderContenido = () => {
    switch (seccionActiva) {
      case "consultar-expediente": {
        // Filtro simple por número, estado o texto
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
                        <th>Fecha</th>
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
                            <td>{exp.fecha_creacion ? new Date(exp.fecha_creacion).toLocaleDateString('es-AR') : 'N/A'}</td>
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
    case "realizar-pase": {
      // Mostrar expedientes recepcionados por el usuario técnico que puede hacer pase
      // Y también aquellos asignados a otro (ya pasados) para que pueda deshacer
      const expedientesMap = new Map();
      for (const exp of expedientesPendientes) {
        const tienePaseUndoble = !!pasesPorExp[exp.id_expediente];
        // Caso 1: Asignado a mí y ya lo recepcioné (puedo realizar pase)
        if (exp.recepcionado && exp.puedeHacerPase && exp.id_profesional_asignado === usuarioLogueado.id_usuario) {
          expedientesMap.set(exp.id_expediente, exp);
        }
        // Caso 2: Ya lo pasé y puedo deshacer
        if (tienePaseUndoble && (exp.estado_actual === 'asignado' || exp.estado_actual === 'en revisión')) {
          expedientesMap.set(exp.id_expediente, exp);
        }
      }
      const expedientesRecepcionados = Array.from(expedientesMap.values());
      const totalPaginasPase = Math.max(1, Math.ceil(expedientesRecepcionados.length / 6));
      const expPagPase = expedientesRecepcionados.slice((paginaPase - 1) * 6, paginaPase * 6);
      return (
        <div className="seccion-contenido seccion-pase">
          <h2>Realizar Pase de Expedientes</h2>
          {expedientesRecepcionados.length === 0 ? (
            <Alert variant="info">No tienes expedientes recepcionados para realizar pase.</Alert>
          ) : (
            <>
              <div className="paginacion mb-2">
                <button className="btn btn-sm btn-outline-secondary me-1" disabled={paginaPase === 1} onClick={() => setPaginaPase(p => p - 1)}>‹</button>
                {Array.from({length: totalPaginasPase}, (_, i) => (
                  <button key={i+1} className={`btn btn-sm me-1 ${paginaPase === i+1 ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setPaginaPase(i+1)}>{i+1}</button>
                ))}
                <button className="btn btn-sm btn-outline-secondary" disabled={paginaPase === totalPaginasPase} onClick={() => setPaginaPase(p => p + 1)}>›</button>
                <span className="ms-2 text-muted" style={{fontSize:'0.85rem'}}>{expedientesRecepcionados.length} expediente(s)</span>
              </div>
              <div className="tabla-container">
                <table className="table table-sm table-bordered">
                  <thead>
                    <tr>
                      <th>Nº Expediente</th>
                      <th>Presentante</th>
                      <th>Tipo</th>
                      <th>Descripción</th>
                      <th>Ubicación</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expPagPase.map(exp => (
                    <tr key={exp.id_expediente}>
                      <td><strong>{exp.numero_expediente}</strong></td>
                      <td>{exp.usuario_presentante_nombre ? `${exp.usuario_presentante_nombre} ${exp.usuario_presentante_apellido}` : 'N/A'}</td>
                      <td>{exp.tipo_expediente || exp.tipo_tramite || 'N/A'}</td>
                      <td>{exp.descripcion || 'N/A'}</td>
                      <td>{exp.ubicacion || 'N/A'}</td>
                      <td>{exp.fecha_creacion ? new Date(exp.fecha_creacion).toLocaleDateString('es-AR') : 'N/A'}</td>
                      <td>
                        <div className="d-flex gap-2">
                          {!!pasesPorExp[exp.id_expediente] ? (
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => setModalDeshacer(exp)}
                            >
                              ↩️ Deshacer Pase
                            </Button>
                          ) : (
                            exp.id_profesional_asignado === usuarioLogueado?.id_usuario && (
                              <Button 
                                variant="primary" 
                                size="sm" 
                                disabled={cargandoDestinatarios === exp.id_expediente}
                                onClick={async () => {
                                  try {
                                    setCargandoDestinatarios(exp.id_expediente);
                                    setExpedienteVer(exp);
                                    setArchivosVer([]);
                                    setInformeTecnico("");
                                    setDestinatarioPase("");
                                    setMensajeVer({ tipo: "", texto: "" });
                                    const resp = await axios.get('http://localhost:8000/usuarios/juridicos');
                                    setUsuariosPase(resp.data || []);
                                    setShowModalVer(true);
                                  } catch (err) {
                                    console.error("Error al preparar pase:", err);
                                  } finally {
                                    setCargandoDestinatarios(null);
                                  }
                                }}
                              >
                                Realizar Pase
                              </Button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>
      );
    }
    case "inicio":
    case "bandeja": {
      // Mostrar solo el último registro por id_expediente, evitando duplicados y usando el id del usuario técnico
      const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));
      const expedientesMap = new Map();
      for (const exp of expedientesPendientes) {
        if (exp.id_profesional_asignado === usuarioLogueado.id_usuario && !exp.reenviado) {
          expedientesMap.set(exp.id_expediente, exp);
        }
      }
      const expedientesUnicos = Array.from(expedientesMap.values());
      const totalPaginasBandeja = Math.max(1, Math.ceil(expedientesUnicos.length / 6));
      const expPagBandeja = expedientesUnicos.slice((paginaBandeja - 1) * 6, paginaBandeja * 6);
      // LOGS DE DEPURACIÓN
      console.log("[BANDEJA] usuarioLogueado:", usuarioLogueado);
      console.log("[BANDEJA] expedientesPendientes:", expedientesPendientes);
      console.log("[BANDEJA] expedientesUnicos:", expedientesUnicos);
      return (
        <div className="seccion-contenido seccion-inicio">
          <h1>Portal de Usuario Técnico</h1>
          <p>Bienvenido al sistema de gestión de expedientes - Área Técnica</p>
          {loadingExpedientes ? (
            <p>Cargando expedientes...</p>
          ) : expedientesUnicos.length > 0 ? (
            <div className="expedientes-pendientes">
              <h2>Bandeja de Entrada - Expedientes asignados</h2>
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
                  disabled={expedientesUnicos.filter(exp => !exp.recepcionado).length === 0}
                >
                  {expedientesSeleccionados.length === expedientesUnicos.filter(exp => !exp.recepcionado).length && expedientesUnicos.filter(exp => !exp.recepcionado).length > 0
                    ? "Deseleccionar Todos"
                    : "Seleccionar Todos"}
                </Button>
              </div>
              <div className="paginacion mb-2">
                <button className="btn btn-sm btn-outline-secondary me-1" disabled={paginaBandeja === 1} onClick={() => setPaginaBandeja(p => p - 1)}>‹</button>
                {Array.from({length: totalPaginasBandeja}, (_, i) => (
                  <button key={i+1} className={`btn btn-sm me-1 ${paginaBandeja === i+1 ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setPaginaBandeja(i+1)}>{i+1}</button>
                ))}
                <button className="btn btn-sm btn-outline-secondary" disabled={paginaBandeja === totalPaginasBandeja} onClick={() => setPaginaBandeja(p => p + 1)}>›</button>
                <span className="ms-2 text-muted" style={{fontSize:'0.85rem'}}>{expedientesUnicos.length} expediente(s)</span>
              </div>
              <div className="tabla-container">
                <table className="tabla-expedientes">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={
                            expedientesUnicos.filter(exp => !exp.recepcionado).length > 0 &&
                            expedientesSeleccionados.length === expedientesUnicos.filter(exp => !exp.recepcionado).length
                          }
                          onChange={toggleSeleccionTodos}
                          disabled={expedientesUnicos.filter(exp => !exp.recepcionado).length === 0}
                        />
                      </th>
                      <th>Nº Expediente</th>
                      <th>Tipo</th>
                      <th>Descripción</th>
                      <th>Nombre</th>
                      <th>Fecha Pase</th>
                      <th>Documentación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expPagBandeja.map(exp => (
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
                        <td>{exp.tipo}</td>
                        <td className="descripcion-cell">{exp.descripcion}</td>
                        <td>{exp.usuario_presentante_nombre ? `${exp.usuario_presentante_nombre} ${exp.usuario_presentante_apellido}` : 'N/A'}</td>
                        <td>{exp.fecha_pase ? new Date(exp.fecha_pase).toLocaleDateString() : '-'}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => abrirModalDoc(exp, true)}
                          >
                            📄 Ver Documentos
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
    }
    case "recepcion-pase":
      return (
        <div className="seccion-contenido">
          <h2>Recepción de Expedientes</h2>
          <p>Gestione la recepción de expedientes asignados al área técnica.</p>
        </div>
      );
    case "analisis-tecnico":
      return (
        <div className="seccion-contenido">
          <h2>Análisis Técnico</h2>
          <p>Realice análisis técnicos de los expedientes asignados.</p>
        </div>
      );
    case "informes-tecnicos":
      return (
        <div className="seccion-contenido">
          <h2>Informes Técnicos</h2>
          <p>Genere y consulte informes técnicos de los expedientes.</p>
        </div>
      );
    case "manual-usuario":
      return (
        <div className="seccion-contenido">
          <h2>Manual de Usuario - Área Técnica</h2>
          <p>Consulte la documentación y guías de uso del sistema para usuarios técnicos.</p>
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

  // Función para cerrar el modal Ver
  const cerrarModalVer = () => {
    setShowModalVer(false);
    setExpedienteVer(null);
    setObservacionVer("");
    setArchivosVer([]);
    setMensajeVer({ tipo: "", texto: "" });
    setCargandoDestinatarios(null);
  };

  const handleDeshacerExito = (id_expediente) => {
    setExpedientesPendientes(prev =>
      prev.map(e => e.id_expediente === id_expediente
        ? { ...e, estado_actual: "en revisión", id_profesional_asignado: usuarioLogueado?.id_usuario, recepcionado: true, puedeHacerPase: true }
        : e
      )
    );
    setPasesPorExp(prev => ({ ...prev, [id_expediente]: false }));
    recargarExpedientes();
  };

  const confirmarDeshacerPase = async () => {
    if (!modalDeshacer) return;
    try {
      await axios.delete(`${URL_HISTORIAL}/deshacer-pase/${modalDeshacer.id_expediente}`);
      handleDeshacerExito(modalDeshacer.id_expediente);
      setModalDeshacer(null);
    } catch (err) {
      alert("Error al deshacer el pase.");
    }
  };

  // Obtener usuario actual desde localStorage
  const usuarioActual = usuarioLogueado;

  return (
    <div className="tecnico-layout">
      {/* Navegación horizontal */}
      <div className="user-nav-bar user-nav-tecnico">
        <Nav variant="pills" className="flex-wrap gap-1 align-items-center">
          <Nav.Item>
            <Nav.Link active={["inicio","bandeja"].includes(seccionActiva)} onClick={() => setSeccionActiva("bandeja")}>📥 Bandeja</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={seccionActiva === "realizar-pase"} onClick={() => setSeccionActiva("realizar-pase")}>📤 Realizar Pase</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={seccionActiva === "consultar-expediente"} onClick={() => setSeccionActiva("consultar-expediente")}>🔍 Consultar</Nav.Link>
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
      <main className="tecnico-main">
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
                  <tr><th>Fecha Creación:</th><td>{new Date(expedienteConsultado.fecha_creacion).toLocaleString("es-AR")}</td></tr>
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
                            <td>{new Date(h.fecha_accion).toLocaleString("es-AR")}</td>
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
        <Modal.Body style={{ padding: '1.5rem' }}>

          {/* Datos del presentante */}
          {expedienteDoc && (
            <div className="mb-4 p-3" style={{ background: '#f0f4ff', borderRadius: '8px', border: '1px solid #c7d4f0' }}>
              <p className="mb-2 fw-semibold text-primary" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Datos del presentante</p>
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
            <div className="mb-4 p-3" style={{ background: '#fff', borderRadius: '8px', border: '1px solid #dee2e6' }}>
              <p className="mb-2 fw-semibold" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#555' }}>Subir documentación</p>
              <Form.Control
                type="file"
                multiple
                onChange={(e) => setArchivosStaged(Array.from(e.target.files))}
                disabled={subiendoDoc}
                className="mb-2"
              />
              {archivosStaged.length > 0 && (
                <Form.Text className="text-muted d-block mb-2">{archivosStaged.length} archivo(s) seleccionado(s)</Form.Text>
              )}
              <Button
                size="sm"
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

          {/* Sección: observaciones (disponible siempre) */}
          <div className="mb-4 p-3" style={{ background: '#fff', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <p className="mb-2 fw-semibold" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#555' }}>Observaciones para el Presentante</p>
            <Form.Control
              type="text"
              placeholder="Escriba una observación para el presentante del expediente..."
              value={observacionTecnico || ""}
              onChange={(e) => { setObservacionTecnico(e.target.value); setErrorObs(""); }}
              isInvalid={!!errorObs}
              disabled={subiendoDoc || subiendoObs}
              className="mb-2"
            />
            <Form.Control.Feedback type="invalid">{errorObs}</Form.Control.Feedback>
            <Button
              size="sm"
              variant="outline-primary"
              disabled={subiendoDoc || subiendoObs}
              onClick={async () => {
                if (!observacionTecnico.trim()) { setErrorObs("Debe escribir una observación antes de guardar."); return; }
                if (!expedienteDoc) return;
                const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
                try {
                  setSubiendoObs(true);
                  await axios.post(URL_OBSERVACIONES, {
                    id_expediente: expedienteDoc.id_expediente,
                    id_usuario: usuario.id_usuario,
                    observacion: observacionTecnico,
                  });
                  // Registrar en el historial para que sea visible en la línea de tiempo
                  await axios.post(URL_HISTORIAL, {
                    id_expediente: expedienteDoc.id_expediente,
                    id_usuario_responsable: usuario.id_usuario,
                    accion: "Observación Técnica",
                    comentario: observacionTecnico,
                    tipo_accion: "observación"
                  });
                  alert("Observación guardada ✅");
                  setObservacionTecnico("");
                  setErrorObs("");
                  cargarObservaciones(expedienteDoc.id_expediente);
                } catch (err) {
                  console.error(err);
                  alert("No se pudo guardar la observación.");
                } finally {
                  setSubiendoObs(false);
                }
              }}
            >
              {subiendoObs ? 'Guardando...' : 'Guardar observación'}
            </Button>
            {observacionesExps.length > 0 ? (
              <div className="mt-3" style={{ maxHeight: '160px', overflowY: 'auto' }}>
                {observacionesExps.map((obs, idx) => (
                  <div key={idx} className="d-flex align-items-start mb-2" style={{ fontSize: '0.85rem', color: '#444' }}>
                    <span className="me-2 text-secondary">•</span>
                    <span>
                      {obs.rol && <strong className="me-1">[{obs.rol}]</strong>}
                      {obs.observacion}
                      {obs.fecha_hora && <span className="text-muted ms-2" style={{ fontSize: '0.78rem' }}>{new Date(obs.fecha_hora).toLocaleString("es-AR")}</span>}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small mt-2 mb-0">Sin observaciones registradas.</p>
            )}
          </div>

          {/* Sección: documentos existentes */}
          {loadingDocs ? (
            <p className="text-muted text-center py-3">Cargando documentos…</p>
          ) : documentosDoc.length > 0 ? (
            <div>
              <p className="mb-2 fw-semibold" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#555' }}>Documentación adjunta</p>
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
                  {documentosDoc.map(doc => (
                    <tr key={doc.id_documento}>
                      <td title={doc.nombre_archivo} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.nombre_archivo}</td>
                      <td>{doc.tipo}</td>
                      <td>{Math.round((doc.tamaño_archivo || 0) / 1024)} KB</td>
                      <td>{doc.fecha_subida ? new Date(doc.fecha_subida).toLocaleDateString("es-AR") : '—'}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <a href={`${URL_DOCUMENTOS}/ver/${doc.id_documento}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">Ver</a>
                          {!modalSoloVer && (
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
                            }}>Eliminar</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted text-center py-3" style={{ fontSize: '0.9rem' }}>No hay documentos adjuntos para este expediente.</p>
          )}

        </Modal.Body>
      </Modal>

      {/* Modal Ver: igual que UsuarioJuridico */}
      <Modal show={showModalVer} onHide={cerrarModalVer} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Expediente: {expedienteVer?.numero_expediente}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {expedienteVer && (
            <>
              <p><strong>Tipo:</strong> {expedienteVer.tipo_expediente || expedienteVer.tipo_tramite || 'N/A'}</p>
              <p><strong>Descripción:</strong> {expedienteVer.descripcion || 'Sin descripción'}</p>
              <p><strong>Fecha de creación:</strong> {new Date(expedienteVer.fecha_creacion).toLocaleString("es-AR")}</p>
              <hr />
              <h5>Informe Técnico</h5>
              <Form.Group className="mb-2">
                <Form.Label>Adjuntar archivo</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  onChange={e => setArchivosVer(Array.from(e.target.files))}
                  disabled={subiendoVer}
                />
                {archivosVer.length > 0 && (
                  <Form.Text className="text-muted">{archivosVer.length} archivo(s) seleccionado(s)</Form.Text>
                )}
              </Form.Group>
              <hr />
              <h5>Realizar Pase</h5>
              <Form.Group controlId="formDestinatarioPase">
                <Form.Label>Destinatario</Form.Label>
                <Form.Select value={destinatarioPase} onChange={e => setDestinatarioPase(e.target.value)}>
                  <option value="">Seleccione destinatario</option>
                  {usuariosPase.map(u => (
                    <option key={u.id_usuario} value={u.id_usuario}>{u.nombre} {u.apellido} ({u.rol || u.tipo_usuario})</option>
                  ))}
                </Form.Select>
                {usuariosPase.length === 0 && (
                  <Form.Text className="text-danger">No hay usuarios jurídicos disponibles.</Form.Text>
                )}
              </Form.Group>
              <Button variant="primary" className="mt-2" onClick={realizarPaseModal} disabled={!destinatarioPase || subiendoVer}>
                {subiendoVer ? "Procesando..." : "Realizar Pase"}
              </Button>
              {mensajeVer.texto && (
                <Alert variant={mensajeVer.tipo} className="mt-3">{mensajeVer.texto}</Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModalVer}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Deshacer Pase */}
      <Modal show={!!modalDeshacer} onHide={() => setModalDeshacer(null)} centered>
        <Modal.Header closeButton className="bg-warning">
          <Modal.Title>⚠️ Deshacer Pase</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas deshacer el último pase del expediente <strong>{modalDeshacer?.numero_expediente}</strong>?</p>
          <p className="text-muted small">
            El expediente volverá a tu bandeja y se quitará la asignación actual.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalDeshacer(null)}>Cancelar</Button>
          <Button variant="danger" onClick={confirmarDeshacerPase}>Sí, deshacer pase</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
