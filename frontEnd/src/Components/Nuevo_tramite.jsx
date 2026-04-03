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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState(null);
  const [expedienteInfo, setExpedienteInfo] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState("dni");

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

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    setError(null);
  };

  const removeFile = (fileName) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== fileName)
    );
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("id_expediente", expedienteInfo.id);
    formData.append("tipo", file.type);
    formData.append("subido_por", expedienteInfo.id_usuario_presentante);

    try {
      const response = await axios.post(
        URL_DOCUMENTOS,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: progress,
            }));
          },
        }
      );

      setUploadedFiles((prev) => [
        ...prev,
        {
          nombre: file.name,
          id: response.data.id_documento,
        },
      ]);

      return response.data;
    } catch (error) {
      console.error("Error al subir archivo:", error);
      throw error;
    }
  };

  const handleUpload = async () => {
    try {
      if (selectedFiles.length === 0) {
        setError("Por favor, seleccione al menos un archivo para subir.");
        return;
      }

      // En la lógica de carga temporal, el expediente aún no existe en la BD formalmente.
      // Usamos el ID del usuario como referencia si es necesario, pero lo importante es 
      // que el backend acepte la subida física de los archivos.
      const expedienteId = usuario?.id_usuario || usuario?.id || 0;


      // Subir múltiples archivos al endpoint '/expedientes/documentos/upload'
      const formData = new FormData();
      formData.append("id_expediente", expedienteId);
      if (usuario) {
        formData.append(
          "subido_por",
          usuario.id_usuario || usuario.usuario || ""
        );
      }
      selectedFiles.forEach((f) => formData.append("files", f));

      const res = await axios.post(URL_SUBIR_DOCUMENTO, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          const total = e.total || 1;
          const progress = Math.round((e.loaded * 100) / total);
          // progreso general opcional
        },
      });

      const resultados = res.data?.resultados || [];
      setUploadedFiles(
        resultados.map((r) => ({
          nombre: r.nombre_archivo,
          id: r.id_documento,
        }))
      );
      // Guardar detalle en localStorage para coherencia con la pantalla de pago
      localStorage.setItem("expedienteFiles", JSON.stringify({ resultados }));
      // Limpiar selección previa (ya subidos)
      localStorage.removeItem("archivosSeleccionados");
      setSelectedFiles([]);
      setError(null);
      // Ir automáticamente a la página de pago
      navigate("/Nuevo_tramitePago");
    } catch (err) {
      console.error("Error en la subida:", err);
      setError("Error al subir los archivos. Revise el servidor.");
    }
  };

  const handleContinuarPago = () => {
    // Verificar que haya al menos un archivo subido
    const storedFiles = localStorage.getItem("expedienteFiles");
    let cantidadArchivos = 0;

    if (storedFiles) {
      try {
        const data = JSON.parse(storedFiles);
        const resultados = data.resultados || [];
        cantidadArchivos = resultados.length;
      } catch (e) {
        console.error("Error al parsear expedienteFiles:", e);
      }
    }

    // Sumar también los archivos en el estado local
    cantidadArchivos += uploadedFiles.length;

    if (cantidadArchivos === 0) {
      setError("Debe subir al menos un archivo antes de continuar al pago.");
      return;
    }

    navigate("/Nuevo_tramitePago");
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
              {documentoSeleccionado === "dni" && (
                <img src={dniEjemplo} alt="Ejemplo DNI" className="imagenEjemplo" />
              )}
              {documentoSeleccionado === "nota" && (
                <img src={notaElevacionEjemplo} alt="Ejemplo Nota de Elevación" className="imagenEjemplo" />
              )}
              {documentoSeleccionado === "plano" && (
                <img src={planoEjemplo} alt="Ejemplo Plano" className="imagenEjemplo" />
              )}
              {documentoSeleccionado === "memoria" && (
                <img src={memoriaEjemplo} alt="Ejemplo Memoria" className="imagenEjemplo" />
              )}
              {documentoSeleccionado === "titulo" && (
                <img src={tituloEjemplo} alt="Ejemplo Título" className="imagenEjemplo" />
              )}
            </div>
          </div>
          <div className="cargaArchivos">
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}

            <Form.Group controlId="formFileMultiple" className="mb-3">
              <Form.Label>Seleccione los archivos a subir:</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </Form.Group>

            {selectedFiles.length > 0 && (
              <div className="selected-files mb-3">
                <h4>Archivos seleccionados:</h4>
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="file-item d-flex align-items-center mb-2"
                  >
                    <span className="me-auto">{file.name}</span>
                    {uploadProgress[file.name] !== undefined && (
                      <ProgressBar
                        now={uploadProgress[file.name]}
                        label={`${uploadProgress[file.name]}%`}
                        style={{ width: "200px", marginRight: "10px" }}
                      />
                    )}
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeFile(file.name)}
                    >
                      Eliminar
                    </Button>
                  </div>
                ))}
                <Button
                  variant="primary"
                  onClick={handleUpload}
                  className="mt-3"
                >
                  Subir Archivos y Continuar al PAGO
                </Button>
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <div className="uploaded-files mb-3">
                <h4>Archivos subidos:</h4>
                <ul className="list-unstyled">
                  {uploadedFiles.map((file, index) => (
                    <li key={index} className="text-success">
                      ✓ {file.nombre}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="contenedorBoton">
            <Button
              className="btn"
              variant="primary"
              type="submit"
              onClick={() => navigate("/Nuevo_tramiteDatos")}
            >
              Atras
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevoTramite;
