import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL_USUARIOS, URL_EXPEDIENTES, URL_TIPOS_TRAMITE } from "../Constants/endpoints";
import { Container, Form, Button } from "react-bootstrap";

import "../CSS/NuevoTramite_datos.css";
import { NUEVO_TRAMITE_EXPEDIENTES } from "../Routers/router";
import lineaTiempo1 from "../assets/linea de tiempo 1.png";

const NuevoTramiteDatos = () => {
  const navigate = useNavigate();

  const [tiposTramite, setTiposTramite] = useState([]);

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

  const initialExpediente = {
    tipo_expediente: "",
    ubicacion: "",
    descripcion: "",
    prioridad: "media",
    estado_actual: "en revisión",
  };

  const [usuario, setUsuario] = useState(initialUsuario);
  const [expediente, setExpediente] = useState(initialExpediente);

  useEffect(() => {
    window.scrollTo(0, 0);
    const usuarioGuardado = localStorage.getItem("usuarioLogueado");
    if (usuarioGuardado) {
      const datosUsuario = JSON.parse(usuarioGuardado);
      setUsuario(datosUsuario);
    }
  }, []);

  useEffect(() => {
    axios.get(URL_TIPOS_TRAMITE)
      .then(({ data }) => setTiposTramite(data))
      .catch((err) => console.error("Error al cargar tipos de trámite:", err));
  }, []);

  const handleChangeExpediente = (e) => {
    setExpediente({ ...expediente, [e.target.name]: e.target.value });
  };
  /*
    BLOQUE: PASO 1 - RECOPILACIÓN DE DATOS (NO INSERTA AÚN)
    Esta función es el cierre de la primera pantalla del 'Trámite'.
    Es vital entender que NO envía los datos a la base de datos todavía.
    Valida el input y guarda temporalmente en LocalStorage ('expedientePendiente') 
    para pasárselos a la pantall de Documentos y posteriormente a la de Pagos.
  */
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Datos del usuario:", usuario);
    console.log("Datos del expediente:", expediente);

    // Validaciones
    if (!expediente.tipo_expediente) {
      alert("Por favor, seleccione un tipo de expediente");
      return;
    }
    if (!expediente.descripcion) {
      alert("Por favor, ingrese una descripción del expediente");
      return;
    }
    if (!expediente.ubicacion) {
      alert("Por favor, ingrese la ubicación del proyecto");
      return;
    }
/*
Crear una función de validación.

const validarFormulario = () => {
  if (!expediente.tipo_expediente) {
    alert("Seleccione un tipo de expediente");
    return false;
  }

  if (!expediente.ubicacion) {
    alert("Ingrese la ubicación");
    return false;
  }

  if (!expediente.descripcion) {
    alert("Ingrese la descripción");
    return false;
  }

  return true;
};
Y usarla así:
if (!validarFormulario()) return;
*/

 // Cargar datos del usuario logueado desde el localStorage para mostrar en el formulario
  

  
    // Verificar que el usuario esté logueado
    const idUsuario = usuario?.id_usuario || usuario?.id;
    console.log("ID del usuario:", idUsuario);

    if (!idUsuario) {
      alert(
        "Error: No se encontró información del usuario. Por favor, inicie sesión nuevamente."
      );
      navigate("/Login_usuario");
      return;
    }

    try {
      const expedienteData = { ...expediente, id_usuario_presentante: idUsuario, fecha_creacion: new Date().toISOString(),
      };

      console.log("Guardando datos del expediente:", expedienteData);
      localStorage.setItem(
        "expedientePendiente",
        JSON.stringify(expedienteData)
      );

      console.log("Navegando a /Nuevo_tramite");
      // Navegamos al paso de carga de archivos
      navigate("/Nuevo_tramite");
    } catch (error) {
      console.error("Error al guardar los datos del expediente:", error);
      let mensajeError = "Error al crear el expediente. ";

      if (error.response?.data) {
        mensajeError +=
          error.response.data.error || error.response.data.mensaje || "";
      } else if (error.request) {
        mensajeError += "No se pudo conectar con el servidor.";
      } else {
        mensajeError += error.message;
      }

      alert(mensajeError);
    }
  };

  {
    //
  }
 

  // menú desplegable tipo de tramite se guardan en la tabla tramite
  const handleTipoExpedienteChange = (e) => {
    const tipo = e.target.value;
    const tipoSeleccionado = tiposTramite.find((t) => t.nombre === tipo);
    const tipoExpedienteDatos = {
      ...expediente,
      tipo_expediente: tipo,
      importe: tipoSeleccionado ? tipoSeleccionado.importe : 0,
    };
    setExpediente(tipoExpedienteDatos);

    // Guardar también en localStorage (para mostrar en pasos siguientes)
    localStorage.setItem("tipoExpediente", JSON.stringify(tipoExpedienteDatos));
  };

  // ---------------------------------------------------------------------
  return (
    <div className="portadaDatos">
      <div className="claseTitulosDatos">
        <h1 className="tituloDatos">Nuevo Trámite</h1>
        <h2 className="subtituloDatos">
          Complete los datos para iniciar su expediente
        </h2>
      </div>

      <Form onSubmit={handleSubmit}>
        <div className="subportadaDatos">
          <div className="lineaTiempoContainerDatos">
            <img src={lineaTiempo1} alt="linea de tiempoDatos" />
          </div>

          <div className="conteinerDatoss">
            <h2 className="tituloDatos2">Datos del trámite</h2>
            <h3 className="subtituloDatos2">
              Ingrese la información del usuario y del proyecto
            </h3>

            <h3 className="tipoDtramite">Tipo de Expediente *</h3>

            <Form.Select
              className="menuDesplegable"
              name="tipo_expediente"
              value={expediente.tipo_expediente}
              onChange={handleTipoExpedienteChange}
              required
            >
              <option value="">Seleccione el tipo de expediente</option>
              {tiposTramite.map((t) => (
                <option key={t.id_tipo} value={t.nombre}>
                  {t.nombre}
                </option>
              ))}
            </Form.Select>

            {/*<Form.Group className="mb-3" controlId="formPrioridad">
              <Form.Label>Prioridad *</Form.Label>
              <Form.Select 
                name="prioridad"
                value={expediente.prioridad}
                onChange={handleChangeExpediente}
                required
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </Form.Select>
            </Form.Group>*/}

            <div className="contenedorFormDatos">
              <h2 className="tituloDatos2">Datos del Usuario</h2>
              <div className="contenedorFormDatos2">
                <Container className="mt-5">
                  <div className="contenedorLabelDatos">
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre *</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={usuario.nombre}
                        disabled
                        style={{ backgroundColor: "#e9ecef", color: "#6c757d" }}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Apellido *</Form.Label>
                      <Form.Control
                        type="text"
                        name="apellido"
                        value={usuario.apellido}
                        disabled
                        style={{ backgroundColor: "#e9ecef", color: "#6c757d" }}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>DNI *</Form.Label>
                      <Form.Control
                        type="text"
                        name="dni"
                        value={usuario.dni}
                        disabled
                        style={{ backgroundColor: "#e9ecef", color: "#6c757d" }}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={usuario.email}
                        disabled
                        style={{ backgroundColor: "#e9ecef", color: "#6c757d" }}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Dirección *</Form.Label>
                      <Form.Control
                        type="text"
                        name="direccion"
                        value={usuario.direccion}
                        disabled
                        style={{ backgroundColor: "#e9ecef", color: "#6c757d" }}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Teléfono *</Form.Label>
                      <Form.Control
                        type="text"
                        name="telefono"
                        value={usuario.telefono}
                        disabled
                        style={{ backgroundColor: "#e9ecef", color: "#6c757d" }}
                      />
                    </Form.Group>
                  </div>
                </Container>
              </div>
            </div>

            <div className="contenedorFormProyecto">
              <div className="contenedorFormProyecto2">
                <h1 className="tituloProyecto">Datos del proyecto</h1>
                <Container className="mt-5">
                  <div className="contenedorLabelProyecto">
                    <Form.Group className="mb-3">
                      <Form.Label>Ubicación *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Dirección, localidad o coordenadas"
                        name="ubicacion"
                        value={expediente.ubicacion}
                        onChange={handleChangeExpediente}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Descripción del expediente *</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Describa detalladamente el motivo del expediente"
                        name="descripcion"
                        value={expediente.descripcion}
                        onChange={handleChangeExpediente}
                        required
                      />
                    </Form.Group>
                  </div>
                </Container>
              </div>
            </div>

            <div className="contenedorBotonDatos">
              <Button
                className="btnAtras"
                variant="primary"
                type="button"
                onClick={() => navigate("/Portada")}
              >
                Atras
              </Button>

              <Button
                size="sm"
                className="btnContinuar"
                variant="primary"
                type="submit"
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default NuevoTramiteDatos;
