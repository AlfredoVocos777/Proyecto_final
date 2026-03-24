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

  //observaciones generales modal ver
  const [observacionTecnico, setObservacionTecnico] = useState("");
  const [errorObs, setErrorObs] = useState("");

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
                  // Buscar si este usuario recepcionó el expediente
                  const recepcionPorUsuario = historial.data.find(h => 
                    h.id_usuario_responsable === idUsuario && 
                    h.accion?.toLowerCase().includes('recepción')
                  );
                  // Buscar la última recepción (cualquier usuario)
                  const ultimaRecepcion = historial.data
                    .filter(h => h.accion?.toLowerCase().includes('recepción'))
                    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
                  // El usuario puede hacer pase solo si él fue quien recepcionó
                  const puedeHacerPase = ultimaRecepcion && ultimaRecepcion.id_usuario_responsable === idUsuario;
                  return { 
                    ...exp, 
                    recepcionado: !!recepcionPorUsuario,
                    puedeHacerPase: puedeHacerPase,
                    recepcionadoPor: ultimaRecepcion?.id_usuario_responsable
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

  const exportarPDF = () => {
    setGenerandoPDF(true);
    try {
      const doc = new jsPDF();
      const fecha = new Date().toLocaleString("es-AR");
      doc.setFontSize(14);
      doc.text("Reporte de Bandeja - Área Técnica", 14, 15);
      doc.setFontSize(10);
      doc.text(`Fecha: ${fecha}`, 14, 22);
      const columns = [
        { header: "N° Expediente", dataKey: "numero" },
        { header: "Tipo", dataKey: "tipo" },
        { header: "Estado", dataKey: "estado" },
        { header: "Fecha Pase", dataKey: "fecha_pase" },
        { header: "Origen", dataKey: "origen" },
        { header: "Observaciones", dataKey: "obs" },
      ];
      const rows = expedientesPendientes.map(e => ({
        numero: e.numero_expediente ?? "",
        tipo: e.tipo_tramite ?? e.tipo_expediente ?? "",
        estado: e.estado ?? e.estado_actual ?? "",
        fecha_pase: e.fecha_pase ? new Date(e.fecha_pase).toLocaleDateString("es-AR") : "",
        origen: e.desde_usuario ?? e.desde_departamento ?? "",
        obs: e.observaciones_pase ?? "",
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
                    
                    const recepcionPorUsuario = historial.data.find(h => 
                      h.id_usuario_responsable === usuarioLogueado.id_usuario && 
                      h.accion?.toLowerCase().includes('recepción')
                    );
                    
                    const ultimaRecepcion = historial.data
                      .filter(h => h.accion?.toLowerCase().includes('recepción'))
                      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
                    
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

      // 3. Subir documentos si corresponde
      if (archivosVer.length > 0) {
        const formData = new FormData();
        archivosVer.forEach((file) => {
          formData.append('files', file);
        });
        formData.append('id_expediente', expedienteVer.id_expediente);
        formData.append('subido_por', usuarioActual.id_usuario);
        const respDoc = await axios.post('http://localhost:8000/api/documentos/subirYRegistrar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (respDoc.status !== 201) {
          setMensajeVer({ tipo: 'warning', texto: respDoc.data?.error || 'Pase realizado pero algunos documentos no se guardaron.' });
        }
      }
      setMensajeVer({ tipo: 'success', texto: 'Pase realizado y documentos guardados.' });
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
        return (
          <div className="seccion-contenido seccion-consulta">
            <h2>Consulta de Expedientes</h2>
            <Form.Group className="mb-3" style={{maxWidth: 400}}>
              <Form.Label>Filtrar por número, estado o usuario</Form.Label>
              <Form.Control
                type="text"
                placeholder="Buscar..."
                value={filtroConsulta}
                onChange={e => setFiltroConsulta(e.target.value)}
                disabled={loadingTodos}
              />
            </Form.Group>
            {loadingTodos ? (
              <p>Cargando expedientes...</p>
            ) : (
              <div className="tabla-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="table table-sm table-bordered">
                  <thead>
                    <tr>
                      <th>Nº Expediente</th>
                      <th>Estado</th>
                      <th>Descripción</th>
                      <th>Usuario Asignado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expedientesFiltrados.map(exp => {
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
                          <td>{exp.estado_actual}</td>
                          <td>{exp.descripcion}</td>
                          <td>{usuarioAsignado}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {expedientesFiltrados.length === 0 && <p>No se encontraron expedientes.</p>}
              </div>
            )}
          </div>
        );
      }
    case "realizar-pase": {
      // Mostrar expedientes recepcionados por el usuario técnico y que puede hacer pase
      const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));
      const expedientesMap = new Map();
      for (const exp of expedientesPendientes) {
        if (exp.recepcionado && exp.puedeHacerPase && exp.id_profesional_asignado === usuarioLogueado.id_usuario) {
          expedientesMap.set(exp.id_expediente, exp);
        }
      }
      const expedientesRecepcionados = Array.from(expedientesMap.values());
      return (
        <div className="seccion-contenido seccion-pase">
          <h2>Realizar Pase de Expedientes</h2>
          {expedientesRecepcionados.length === 0 ? (
            <Alert variant="info">No tienes expedientes recepcionados para realizar pase.</Alert>
          ) : (
            <div className="tabla-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table className="table table-sm table-bordered">
                <thead>
                  <tr>
                    <th>Nº Expediente</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {expedientesRecepcionados.map(exp => (
                    <tr key={exp.id_expediente}>
                      <td><strong>{exp.numero_expediente}</strong></td>
                      <td>{exp.tipo_expediente || exp.tipo_tramite || 'N/A'}</td>
                      <td>{exp.estado_actual || exp.estado || 'N/A'}</td>
                      <td>
                        <Button variant="primary" size="sm" onClick={async () => {
                          setExpedienteVer(exp);
                          // Cargar usuarios jurídicos como destinatarios
                          try {
                            const resp = await axios.get('http://localhost:8000/usuarios/juridicos');
                            setUsuariosPase(resp.data || []);
                          } catch (err) {
                            setUsuariosPase([]);
                          }
                          setShowModalVer(true);
                        }}>
                          Realizar Pase
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
      // LOGS DE DEPURACIÓN
      console.log("[BANDEJA] usuarioLogueado:", usuarioLogueado);
      console.log("[BANDEJA] expedientesPendientes:", expedientesPendientes);
      console.log("[BANDEJA] expedientesUnicos:", expedientesUnicos);
      return (
        <div className="seccion-contenido seccion-inicio">
          <h1>Portal de Usuario Técnico</h1>
          <p>Bienvenido al sistema de gestión de expedientes - Área Técnica</p>
          <BotonesReporte onGenerarPDF={exportarPDF} generando={generandoPDF} mostrarVolver={false} />
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
                      <th>Estado</th>
                      <th>Fecha Pase</th>
                      <th>Desde</th>
                      <th>Observaciones</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expedientesUnicos.map(exp => (
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
  };

  // Obtener usuario actual desde localStorage
  const usuarioActual = (() => {
    try {
      const raw = localStorage.getItem("usuarioLogueado");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  // Recargar expedientes
  const recargarExpedientes = () => {
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
                  h.accion?.toLowerCase().includes('recepción')
                );
                
                const ultimaRecepcion = historial.data
                  .filter(h => h.accion?.toLowerCase().includes('recepción'))
                  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
                
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
  };

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
            <Nav.Link active={seccionActiva === "manual-usuario"} onClick={() => setSeccionActiva("manual-usuario")}>📖 Manual</Nav.Link>
          </Nav.Item>
        </Nav>
      </div>

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
          <Form.Group className="mb-3">
            <Form.Label><strong>Observaciones</strong></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Agregue observaciones técnicas sobre la recepción..."
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
        <Modal.Header closeButton>
          <Modal.Title>Documentos del Expediente {expedienteDoc?.numero_expediente}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {mensajeDoc.tipo && mensajeDoc.texto && (
            <Alert variant={mensajeDoc.tipo}>{mensajeDoc.texto}</Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label><strong>Seleccionar archivos</strong></Form.Label>
            <Form.Control
              type="file"
              multiple
              onChange={(e) => setArchivosStaged(Array.from(e.target.files))}
              disabled={subiendoDoc}
            />
            <Form.Text>Archivos seleccionados: {archivosStaged.length}</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label><strong>Comentario técnico</strong></Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Descripción técnica de los documentos..."
              value={comentarioDoc}
              onChange={(e) => setComentarioDoc(e.target.value)}
              disabled={subiendoDoc}
            />
          </Form.Group>

         
                        {/*Observaciones grales*/}
          
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <strong>Observaciones generales:</strong>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Escriba observaciones generales del expediente..."
                              value={observacionTecnico || ""}
                              onChange={(e) => {
                                setObservacionTecnico(e.target.value);
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
          
                                if (!observacionTecnico.trim()) {
                                  setErrorObs("Debe escribir una observación antes de guardar.");
                                  return;
                                }
          
                                if (!expedienteDoc) return;
                                  const usuario = JSON.parse(
                                  localStorage.getItem("usuarioLogueado")
                                );
                                try {
                                  await axios.post(URL_OBSERVACIONES, {
                                    id_expediente: expedienteDoc.id_expediente,
                                    id_usuario: usuario.id_usuario,
                                    observacion: observacionTecnico,
                                  });
          
                                  alert("Observación guardada ✅");
                                  setObservacionTecnico(""); // opcional: limpiar input
                                  setErrorObs("");
          
                                } catch (err) {
                                  console.error(err);
                                  alert("No se pudo guardar la observación.");
          
                                }
          
                      
                                console.log("Enviando observación:", {
                                id_expediente: expedienteDoc.id_expediente,
                                id_usuario: usuario?.id_usuario,
                                rol: usuario?.rol,
                                observacion: observacionTecnico,
                              });
          
          
                              }}
                            >
                              Guardar Observación
                            </Button>
                          </Form.Group>
                              <br />
                              
                              <br />

                              {/*--------------------------------------*/}

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
                      <td>{doc.fecha_subida ? new Date(doc.fecha_subida).toLocaleString("es-AR") : '-'}</td>
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

      {/* Modal Ver: igual que UsuarioJuridico */}
      <Modal show={showModalVer} onHide={cerrarModalVer} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Expediente: {expedienteVer?.numero_expediente}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {expedienteVer && (
            <>
              <p><strong>Tipo:</strong> {expedienteVer.tipo_expediente || expedienteVer.tipo_tramite || 'N/A'}</p>
              <p><strong>Estado:</strong> {expedienteVer.estado_actual || expedienteVer.estado || 'N/A'}</p>
              <p><strong>Fecha de creación:</strong> {new Date(expedienteVer.fecha_creacion).toLocaleString("es-AR")}</p>
              <hr />
              <Form.Group controlId="formArchivosVer">
                <Form.Label>Adjuntar Documentos</Form.Label>
                <Form.Control type="file" multiple onChange={handleArchivosVer} />
              </Form.Group>
              <hr />
              <h5>Observaciones</h5>
              <Form.Group controlId="formObservacionVer">
                <Form.Control as="textarea" rows={3} value={observacionVer} onChange={e => setObservacionVer(e.target.value)} placeholder="Escriba una observación..." />
              </Form.Group>
              <hr />
              <h5>Realizar Pase</h5>
              <Form.Group controlId="formDestinatarioPase">
                <Form.Label>Destinatario</Form.Label>
                <Form.Select value={destinatarioPase} onChange={e => setDestinatarioPase(e.target.value)}>
                  <option value="">Seleccione destinatario</option>
                  {usuariosPase.map(u => (
                    <option key={u.id_usuario} value={u.id_usuario}>{u.nombre} {u.apellido} ({u.tipo_usuario})</option>
                  ))}
                </Form.Select>
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
    </div>
  );
}
