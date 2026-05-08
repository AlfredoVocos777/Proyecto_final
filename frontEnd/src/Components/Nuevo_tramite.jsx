import { Container, Form, Button, ProgressBar, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "../CSS/NuevoTramite.css";
import lineaTiempo2 from "../assets/linea de tiempo 2.png";
import dniEjemplo from "../assets/dni-ejemplo.svg";
import planoEjemplo from "../assets/plano-ejemplo.svg";
import memoriaEjemplo from "../assets/memoria-ejemplo.svg";
import tituloEjemplo from "../assets/titulo-ejemplo.svg";
import notaElevacionEjemplo from "../assets/nota-elevacion-ejemplo.svg";
import { URL_EXPEDIENTES, URL_SUBIR_DOCUMENTO, URL_DOCUMENTOS } from "../Constants/endpoints";

const NuevoTramite = () => {
  const navigate = useNavigate();
  const [filesByType, setFilesByType] = useState({
    dni: null,
    nota: null,
    plano: null,
    memoria: null,
    titulo: null,
  });
  const [error, setError] = useState(null);
  const [expedienteInfo, setExpedienteInfo] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState("dni");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Recuperar información del expediente pendiente del localStorage
    const expedientePendiente = localStorage.getItem("expedientePendiente");
    if (expedientePendiente) {
      const datos = JSON.parse(expedientePendiente);
      setExpedienteInfo(datos);
    } else {
      setError(
        "No se encontró información del expediente. Por favor, complete los datos primero."
      );
      navigate("/Nuevo_tramiteDatos");
    }

    const usr = localStorage.getItem("usuarioLogueado");
    if (usr) {
      setUsuario(JSON.parse(usr));
    }

    // Limpiar archivos previos al entrar a esta página
    // Solo mantener si hay un expediente ya creado
    const expedienteCreado = localStorage.getItem("expedienteCreado");
    if (!expedienteCreado) {
      localStorage.removeItem("expedienteFiles");
      setUploadedFiles([]);
    }
  }, [navigate]);

  const handleFileChange = (type, event) => {
    const file = event.target.files[0];
    if (file) {
      setFilesByType((prev) => ({ ...prev, [type]: file }));
      setError(null);
    }
  };

  const removeFileByType = (type) => {
    setFilesByType((prev) => ({ ...prev, [type]: null }));
    const input = document.getElementById(`file-${type}`);
    if (input) input.value = "";
  };

  const handleUpload = async () => {
    try {
      const archivosArray = Object.values(filesByType).filter((f) => f !== null);
      if (archivosArray.length === 0) {
        setError("Por favor, suba al menos un archivo para continuar.");
        return;
      }

      setIsUploading(true);
      setError(null);

      const expedienteId = usuario?.id_usuario || usuario?.id || 0;
      const subidoPor = usuario?.id_usuario || usuario?.usuario || "";

      // Realizamos subidas individuales para cada categoría para guardar la metadata correctamente
      const resultadosFinales = [];
      
      for (const [tipo, archivo] of Object.entries(filesByType)) {
        if (archivo) {
          const formData = new FormData();
          formData.append("id_expediente", expedienteId);
          formData.append("subido_por", subidoPor);
          formData.append("categoria", tipo); // Guardamos la categoría (dni, nota, etc.)
          formData.append("files", archivo);

          const res = await axios.post(URL_SUBIR_DOCUMENTO, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (res.data?.resultados) {
            resultadosFinales.push(...res.data.resultados);
          }
        }
      }

      setUploadedFiles(
        resultadosFinales.map((r) => ({
          nombre: r.nombre_archivo || r.nombre,
          id: r.id_documento,
        }))
      );
      
      localStorage.setItem("expedienteFiles", JSON.stringify({ resultados: resultadosFinales }));
      localStorage.removeItem("archivosSeleccionados");
      
      navigate("/Nuevo_tramitePago");
    } catch (err) {
      console.error("Error en la subida:", err);
      setError("Error al subir los archivos. Revise el servidor.");
      setIsUploading(false);
    }
  };

  //-----------------------------------------------------

  return (
    <div className="portada2">
      <div className="claseTitulos2">
        <h1 className="titulo2">Nuevo Trámite</h1>
        <h2 className="subtitulo2">
          Complete la documentación requerida para iniciar su expediente
        </h2>
      </div>
      <div className="subportada2">
        <div className="lineaTiempoContainer">
          <img src={lineaTiempo2} alt="linea de tiempo" />
        </div>

        <div className="conteinerDocumentacion">
          <div>
            <h2 className="tituloLista">Documentos Requeridos:</h2>
            <h3 className="subtituloDocumentacion">
              Complete los documentos necesarios para su trámite:
            </h3>
            <br></br>
            <ul className="listaDocumentacion">
              <li 
                className={documentoSeleccionado === "dni" ? "documento-activo" : ""}
                onClick={() => setDocumentoSeleccionado("dni")}
                style={{ cursor: "pointer" }}
              >
                DNI del presentante (frente y dorso)
              </li>
              <li 
                className={documentoSeleccionado === "nota" ? "documento-activo" : ""}
                onClick={() => setDocumentoSeleccionado("nota")}
                style={{ cursor: "pointer" }}
              >
                Nota de elevación (con firma y aclaración)
              </li>
              <li 
                className={documentoSeleccionado === "plano" ? "documento-activo" : ""}
                onClick={() => setDocumentoSeleccionado("plano")}
                style={{ cursor: "pointer" }}
              >
                Plano de ubicación de proyecto
              </li>
              <li 
                className={documentoSeleccionado === "memoria" ? "documento-activo" : ""}
                onClick={() => setDocumentoSeleccionado("memoria")}
                style={{ cursor: "pointer" }}
              >
                Memoria descriptiva
              </li>
              <li 
                className={documentoSeleccionado === "titulo" ? "documento-activo" : ""}
                onClick={() => setDocumentoSeleccionado("titulo")}
                style={{ cursor: "pointer" }}
              >
                Titulo de propiedad o boleto de compra venta
              </li>
            </ul>
            
            {/* Imágenes ilustrativas */}
            <div className="ejemploDocumento">
              {documentoSeleccionado === "dni" && <img src={dniEjemplo} alt="Ejemplo DNI" className="imagenEjemplo" />}
              {documentoSeleccionado === "nota" && <img src={notaElevacionEjemplo} alt="Ejemplo Nota de Elevación" className="imagenEjemplo" />}
              {documentoSeleccionado === "plano" && <img src={planoEjemplo} alt="Ejemplo Plano" className="imagenEjemplo" />}
              {documentoSeleccionado === "memoria" && <img src={memoriaEjemplo} alt="Ejemplo Memoria" className="imagenEjemplo" />}
              {documentoSeleccionado === "titulo" && <img src={tituloEjemplo} alt="Ejemplo Título" className="imagenEjemplo" />}
              
              {/* Controles de archivo al final de la hoja de la pestaña */}
              <div className="controlesArchivo">
                <input
                  type="file"
                  id={`file-${documentoSeleccionado}`}
                  style={{ display: "none" }}
                  onChange={(e) => handleFileChange(documentoSeleccionado, e)}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                {!filesByType[documentoSeleccionado] ? (
                  <Button className="boton-accion-pestañas" variant="primary" onClick={() => document.getElementById(`file-${documentoSeleccionado}`).click()}>
                    Añadir archivo para {documentoSeleccionado.toUpperCase()}
                  </Button>
                ) : (
                  <>
                    <span className="archivoSubidoTexto">
                      ✓ {filesByType[documentoSeleccionado].name}
                    </span>
                    <Button variant="info" onClick={() => window.open(URL.createObjectURL(filesByType[documentoSeleccionado]))}>
                      Ver
                    </Button>
                    <Button variant="danger" onClick={() => removeFileByType(documentoSeleccionado)}>
                      Eliminar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          {error && (
            <Alert variant="danger" className="mb-3 mt-4">
              {error}
            </Alert>
          )}
          
          <div className="contenedorBoton">
            <Button
              className="btn"
              variant="secondary"
              onClick={() => navigate("/Nuevo_tramiteDatos")}
              disabled={isUploading}
            >
              Atrás
            </Button>
            <Button
              className="btn boton-subir-pago"
              variant="primary"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? "Subiendo..." : "Subir Archivos y Continuar al PAGO"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevoTramite;
