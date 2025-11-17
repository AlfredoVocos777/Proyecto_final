import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import axios from "axios";
import { URL_EXPEDIENTES, URL_DOCUMENTOS } from "../Constants/endpoints";

import "../CSS/Nuevo_tramitePago.css";
import mercadopagoIcono from "../assets/mercadopago.png";
import lineaTiempo3 from "../assets/linea de tiempo 3.png";
import tarjetaIcono from "../assets/tarjeta.png";
import pagofacilIcono from "../assets/pagofacil.png";

const NuevoTramitePago = () => {
  const navigate = useNavigate();

  const initialUsuario = {
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    direccion: "",
    telefono: "",
    usuario: "",
    contraseña: "",
  };

  const initialTramite = {
    tipo_expediente: "",
    ubicacion: "",
    descripcion: "",
    prioridad: "",
  };

  const [usuario, setUsuario] = useState(initialUsuario);
  const [tramite, setTramite] = useState(initialTramite);
  const [loading, setLoading] = useState(false);
  const [documentos, setDocumentos] = useState([]);

  // Función para convertir la ruta del backend en URL accesible por el navegador
  const toFileUrl = (ruta) => {
    if (!ruta) return null;
    const idx = ruta.lastIndexOf("uploads");
    if (idx !== -1) {
      const relative = ruta.substring(idx).replace(/\\/g, "/");
      return `http://localhost:8000/${relative}`;
    }
    return ruta;
  };

  // Función para manejar el pago
  const handlePago = async (metodo) => {
    const URL_FORMALIZACION = "http://localhost:8000/pagos";

    if (metodo === "mercadopago") {
      try {
        const expedientePendiente = localStorage.getItem("expedientePendiente");
        const storedFiles = localStorage.getItem("expedienteFiles");
        const usuarioGuardado = localStorage.getItem("usuarioLogueado");

        if (!expedientePendiente || !usuarioGuardado) {
          alert("Error: Faltan datos esenciales del expediente o usuario.");
          navigate("/Nuevo_tramiteDatos");
          return;
        }

        const datosExpediente = JSON.parse(expedientePendiente);
        const datosUsuario = JSON.parse(usuarioGuardado);
        const archivosTemporales = storedFiles
          ? JSON.parse(storedFiles).resultados || JSON.parse(storedFiles)
          : [];

        setLoading(true);

        const payload = {
          expediente: {
            ...datosExpediente,
            id_usuario: datosUsuario.id_usuario,
          },
          pago: {
            monto: 5000,
            metodo_pago: "mercadopago",
            referencia_pasarela: `SIMULADO-MP-${Date.now()}`,
          },
          archivos: archivosTemporales,
        };

        console.log("Enviando datos para formalización y pago:", payload);

        const responseFormalizacion = await axios.post(
          URL_FORMALIZACION,
          payload
        );
        const dataFormalizacion = responseFormalizacion.data;

        const expedienteFormalizado = {
          ...datosExpediente,
          id: dataFormalizacion.id_expediente,
          numero_expediente: dataFormalizacion.numero_expediente,
          fecha_creacion: dataFormalizacion.fecha_creacion,
        };
        localStorage.setItem(
          "expedienteCreado",
          JSON.stringify(expedienteFormalizado)
        );

        alert(
          `¡Tu pago fue exitoso! El número de tu expediente es: ${expedienteFormalizado.numero_expediente}. Serás redirigido a la confirmación.`
        );
        window.open("https://www.mercadopago.com.ar", "_blank");

        localStorage.removeItem("expedientePendiente");
        localStorage.removeItem("expedienteFiles");
        localStorage.removeItem("archivosSeleccionados");

        navigate("/Nuevo_tramiteExpediente");
      } catch (error) {
        console.error("Error al formalizar el trámite y pago:", error);
        const errorMsg = error.response?.data?.error || error.message;
        alert("Error al procesar el pago y crear el expediente: " + errorMsg);
      } finally {
        setLoading(false);
      }
    } else if (metodo === "tarjeta") {
      alert("Próximamente: Pago con tarjeta");
    } else if (metodo === "efectivo") {
      alert("Próximamente: Pago en efectivo");
    } else {
      alert("Método de pago no reconocido");
    }
  };

  // Cargar documentos (solo vista previa, sin eliminar)
  useEffect(() => {
    const expPendiente = localStorage.getItem("expedientePendiente");

    if (!expPendiente) {
      const selected = localStorage.getItem("archivosSeleccionados");
      if (selected) {
        try {
          const arr = JSON.parse(selected);
          const docs = (arr || []).map((f) => ({
            id_documento: null,
            nombre_archivo: f.name,
            ruta_archivo: null,
          }));
          setDocumentos(docs);
          return;
        } catch {}
      }
      setDocumentos([]);
      return;
    }

    try {
      const stored = localStorage.getItem("expedienteFiles");
      let merged = [];

      if (stored) {
        try {
          const data = JSON.parse(stored);
          const resultados = data.resultados || data;
          merged = (resultados || []).map((r) => ({
            id_documento: r.id_documento,
            nombre_archivo: r.nombre_archivo,
            ruta_archivo: toFileUrl(r.ruta_archivo),
          }));
        } catch {}
      }

      const selected = localStorage.getItem("archivosSeleccionados");
      if (selected) {
        try {
          const arr = JSON.parse(selected);
          (arr || []).forEach((f) => {
            const exists = merged.some((m) => m.nombre_archivo === f.name);
            if (!exists) {
              merged.push({
                id_documento: null,
                nombre_archivo: f.name,
                ruta_archivo: null,
              });
            }
          });
        } catch {}
      }

      setDocumentos(merged);
    } catch (e) {
      console.warn("No se pudieron cargar documentos:", e);
    }
  }, []);

  // Cargar datos del usuario y del expediente
  useEffect(() => {
    try {
      const usuarioGuardado = localStorage.getItem("usuarioLogueado");
      if (usuarioGuardado) {
        setUsuario(JSON.parse(usuarioGuardado));
      } else {
        navigate("/Login");
        return;
      }

      const expDataStored =
        localStorage.getItem("expedientePendiente") ||
        localStorage.getItem("expedienteCreado");
      if (expDataStored) {
        const datosExpediente = JSON.parse(expDataStored);
        setTramite({
          tipo_expediente: datosExpediente.tipo_expediente || "",
          ubicacion: datosExpediente.ubicacion || "",
          descripcion: datosExpediente.descripcion || "",
          prioridad: datosExpediente.prioridad || "",
        });
      } else {
        navigate("/Nuevo_tramiteDatos");
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert("Error al cargar los datos necesarios para el pago");
      navigate("/Portada");
    }
  }, [navigate]);

  //----------------------------------------------------

  return (
    <div className="portadaDatos">
      <div className="claseTitulosDatos">
        <h1 className="tituloDatos">Nuevo Trámite</h1>
        <h2 className="subtituloDatos">
          Complete el pago para iniciar su expediente
        </h2>
      </div>

      <div className="subportadaDatos">
        <div className="lineaTiempoContainerDatos">
          <img src={lineaTiempo3} alt="linea de tiempoDatos" />
        </div>

        <div className="conteinerDatoss">
          {/* Resumen del tramite */}
          <div className="contenedorFormPago">
            <h2 className="tituloDatos2">Resumen del tramite</h2>
            <div className="contenedorFormPago2">
              <div className="filaPago">
                <label className="labelPago">Nombre</label>
                <span className="valorPago">{usuario.nombre}</span>
              </div>
              <div className="filaPago">
                <label className="labelPago">Apellido</label>
                <span className="valorPago">{usuario.apellido}</span>
              </div>
              <div className="filaPago">
                <label className="labelPago">Tipo de expediente</label>
                <span className="valorPago">{tramite.tipo_expediente}</span>
              </div>
              <div className="filaPago">
                <label className="labelPagoTatal">Total a Pagar</label>
                <label> - <strong>$5.000</strong> - </label>
              </div>
            </div>
          </div>

          {/* Archivos adjuntos (solo vista previa) */}
          <div className="contenedorFormPago" style={{ marginTop: 16 }}>
            <h2 className="tituloDatos2">Archivos adjuntos</h2>
            {documentos.length === 0 ? (
              <p className="text-muted" style={{ margin: 0 }}>
                No hay archivos adjuntos.
              </p>
            ) : (
              <div className="archivosAdjuntos">
                {documentos.map((doc, idx) => (
                  <div
                    className="archivoItem"
                    key={doc.id_documento || `${doc.nombre_archivo}-${idx}`}
                  >
                    <div className="archivoNombre">
                      {doc.nombre_archivo}
                      {!doc.id_documento && (
                        <span className="badge badge-pendiente">No subido</span>
                      )}
                    </div>
                    <div className="archivoAcciones">
                      {doc.ruta_archivo && (
                        <a
                          href={doc.ruta_archivo}
                          target="_blank"
                          rel="noreferrer"
                          className="linkVer"
                        >
                          Ver
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medios de pago */}
          <div className="contenedorFormMedioPago">
            <div className="contenedorFormMedioPago2">
              <h1 className="tituloMedioPago">Pago seguro</h1>
              <h4 className="subtituloMedioPago">
                Complete el pago para finalizar la presentación de su expediente
              </h4>
            </div>
            <hr />
            <div className="contenedorFormMedioPago2">
              <h2 className="tituloMedioPago2">Seleccione el medio de pago</h2>
            </div>

            <div className="opcionesMedioPago">
              <button
                className="opcionMedioPago"
                onClick={() => handlePago("mercadopago")}
                disabled={loading}
              >
                <img
                  className="iconomercadopago"
                  src={mercadopagoIcono}
                  alt="mercadopago"
                  width="90"
                  height="40"
                />
                {loading ? "Procesando..." : "Mercado Pago (Simulado)"}
              </button>

              <button
                className="opcionMedioPago"
                onClick={() => handlePago("tarjeta")}
                disabled={loading}
              >
                <img
                  className="iconoTarjeta"
                  src={tarjetaIcono}
                  alt="tarjeta"
                  width="90"
                  height="40"
                />
                Tarjeta de Crédito
              </button>

              <button
                className="opcionMedioPago"
                onClick={() => handlePago("efectivo")}
                disabled={loading}
              >
                <img
                  className="iconoPagofacil"
                  src={pagofacilIcono}
                  alt="pago facil"
                  width="100"
                  height="50"
                />
                Pago en efectivo
              </button>
            </div>
          </div>

          {/* Botón atrás */}
          <div className="contenedorBotonDatos">
            <Button
              className="btnAtras"
              variant="primary"
              type="button"
              onClick={() => navigate("/Nuevo_tramite")}
            >
              Atras
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevoTramitePago;
