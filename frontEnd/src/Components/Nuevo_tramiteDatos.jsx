import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL_USUARIOS } from "../Constants/endpoints";
import { URL_TRAMITE } from "../Constants/endpoints";
import { Container, Form, Button } from "react-bootstrap";

import "../CSS/NuevoTramite_datos.css";
import lineaTiempo1 from "../assets/linea de tiempo 1.png";

const NuevoTramiteDatos = () => {
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
    tipo_tramite: "",
    denominacion: "",
    ubicacion: "",
    descripcion: "",
  };


  const [usuario, setUsuario] = useState(initialUsuario);
  const [tramite, setTramite] = useState(initialTramite);


  {
    //---------------------------------------------------------
  }
  const handleChangeUsuario = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };
  
  const handleChangeTramite = (e) => {
    setTramite({ ...tramite, [e.target.name]: e.target.value });
  };
  

  {
    //---------------------------------------------------------
  }
//  Datos del proyecto se crean y se guardan en la base de datos en la tabla tramite
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita recargar la página si es un submit
     try {
      const data = { 
      ...tramite, 
      id_usuario: usuario.id_usuario // id del usuario actual que se guardara en la tabla tramie
    };
      const response = await axios.post(URL_TRAMITE, data);
    console.log("✅ Trámite guardado exitosamente:", response.data);
     

    setTramite(initialTramite);
    alert("Trámite creado exitosamente");
    navigate("/Nuevo_tramite");
  } catch (error) {
    console.error("❌ Error al guardar los datos del tramite:", error);
  }
  };

  {
    // 
  }
  // Cargar datos del usuario logueado desde el localStorage para mostrar en el formulario
  useEffect(() => {
  const usuarioGuardado = localStorage.getItem("usuarioLogueado");
  if (usuarioGuardado) {
    const datosUsuario = JSON.parse(usuarioGuardado);
    setUsuario(datosUsuario);
  }
}, []);

// menú desplegable tipo de tramite se guardan en la tabla tramite
const handleTipoTramiteChange = (e) => {
  const tipoTramiteDatos = { ...tramite, tipo_tramite: e.target.value };
  setTramite(tipoTramiteDatos);

  // Guardar también en localStorage
  localStorage.setItem("tipoTramite", JSON.stringify(tipoTramiteDatos));
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


      <div className="subportadaDatos">

        <div className="lineaTiempoContainerDatos">
          <img src={lineaTiempo1} alt="linea de tiempoDatos" />
        </div>

        <div className="conteinerDatoss">

          <h2 className="tituloDatos2">Datos del trámite</h2>
          <h3 className="subtituloDatos2">Ingrese la información del usuario y del proyecto</h3>

          <h3 className="tipoDtramite">Tipo de Trámite *</h3>
          
          <select className="menuDesplegable"
            name="tipo_tramite"
            value={tramite.tipo_tramite}
            onChange={handleTipoTramiteChange}
          >
            <option value="">Seleccione el tipo de trámite</option>
            <option value="Obra nueva">Obra nueva</option>
            <option value="Rivera">Rivera</option>
            <option value="Rio">Río</option>
          </select>


          {/* Formulario Datos*/}
          <div className="contenedorFormDatos">
            <h2 className="tituloDatos2">Datos del Usuario</h2>

            <div className="contenedorFormDatos2">
              <Container className="mt-5">
                <Form onSubmit={handleSubmit}>
                  <div className="contenedorLabelDatos">
                    <Form.Group
                      className="mb-3"
                      controlId="exampleForm.ControlInput1"
                    >
                      <Form.Label>Nombre *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder=" "
                        name="nombre"
                        value={usuario.nombre}
                        disabled
                        style={{ backgroundColor: "#e9ecef", color: "#6c757d" }}
                        onChange={handleChangeUsuario}
                      />
                    </Form.Group>

                    <Form.Group
                      className="mb-3"
                      controlId="exampleForm.ControlInput1"
                    >
                      <Form.Label>Apellido *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder=" "
                        name="apellido"
                        value={usuario.apellido}
                        disabled
                        style={{ backgroundColor: "#e9ecef", color: "#6c757d" }}
                        onChange={handleChangeUsuario}
                      />
                    </Form.Group>

                    <Form.Group
                      className="mb-3"
                      controlId="exampleForm.ControlTextareal"
                    >
                      <Form.Label>DNI *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder=" "
                        name="dni"
                        value={usuario.dni}
                        disabled
                        style={{ backgroundColor: "#e9ecef", color: "#6c757d" }}
                        onChange={handleChangeUsuario}
                      />
                    </Form.Group>
                    <Form.Group
                      className="mb-3"
                      controlId="exampleForm.ControlTextarea1"
                    >
                      <Form.Label>email *</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder=" "
                        name="email"
                        value={usuario.email}
                        disabled
                        style={{ backgroundColor: "#e9ecef", color: "#6c757d" }}
                        onChange={handleChangeUsuario}
                      />
                    </Form.Group>
                    <Form.Group
                      className="mb-3"
                      controlId="exampleForm.ControlTextarea1"
                    >
                      <Form.Label>Dirección *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder=" "
                        name="direccion"
                        value={usuario.direccion}
                        disabled
                        style={{ backgroundColor: "#e9ecef", color: "#6c757d" }}
                        onChange={handleChangeUsuario}
                      />
                    </Form.Group>

                    <Form.Group
                      className="mb-3"
                      controlId="exampleForm.ControlTextarea1"
                    >
                      <Form.Label>Teléfono *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder=" "
                        name="telefono"
                        value={usuario.telefono}
                        disabled
                        style={{ backgroundColor: "#e9ecef", color: "#6c757d" }}
                        onChange={handleChangeUsuario}
                      />
                    </Form.Group>
                  </div>
                </Form>
                <br />
              </Container>
            </div>
          </div>





          {/* Formulario Datos del Proyecto*/}

          <div className="contenedorFormProyecto">
            <div className="contenedorFormProyecto2">
              <h1 className="tituloProyecto">Datos del proyecto</h1>
              <Container className="mt-5">
                <Form onSubmit={handleSubmit}>
                  <div className="contenedorLabelProyecto">
                    <Form.Group
                      className="mb-3"
                      controlId="exampleForm.ControlInput1"
                    >
                      <Form.Label>Denominación del proyecto *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ej: Construcción de vivienda unifamiliar"
                        name="denominacion"
                        value={tramite.denominacion}
                        onChange={handleChangeTramite}
                      />
                    </Form.Group>

                    <Form.Group
                      className="mb-3"
                      controlId="exampleForm.ControlInput1"
                    >
                      <Form.Label>Ubicación *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ingrese la dirección del proyecto"
                        name="ubicacion"
                        value={tramite.ubicacion}
                        onChange={handleChangeTramite}
                      />
                    </Form.Group>

                    <Form.Group
                      className="mb-3"
                      controlId="exampleForm.ControlTextareal"
                    >
                      <Form.Label>Descripción del proyecto *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Describa brevemente la descripción del proyecto"
                        name="descripcion"
                        value={tramite.descripcion}
                        onChange={handleChangeTramite}
                      />
                    </Form.Group>
                  </div>
                </Form>
                <br />
              </Container>
            </div>
          </div>

          <div className="contenedorBotonDatos">
            
            <Button className='btnAtras'
              variant="primary" 
              type="button" 
              onClick={() => navigate("/Portada")}
            >           
              Atras
            </Button>

            <Button
              size="sm"
              className="btn-cancelar3"
              variant="secondary"
              type="button"
              onClick={(e) => handleSubmit(e)}
            >
              Continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevoTramiteDatos;
