import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL_USUARIOS } from "../Constants/endpoints";
import { Container, Form, Button } from "react-bootstrap";

import "../CSS/registroUsuario.css";
import cargaUsuario from "../assets/carga_usuario.png";

const RegistroUsuario = () => {
  const navigate = useNavigate();
  const initialState = {
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    direccion: "",
    telefono: "",
    usuario: "",
    contraseña: "",
  };
  const [usuario, setUsuario] = useState(initialState);
  // ---------------------------------------------------------
  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };
  // ---------------------------------------------------------

  /*
    BLOQUE: CREACIÓN CENTRAL DE PERFIL
    Manejamos el 'submit' del formulario asíncronamente interceptando el evento clásico
    (e.preventDefault) y haciendo un POST hacia nuestra API (Backend) con el objeto de estado reactivo 'usuario'
    que contiene DNI, Email, Password. Si la BD responde con un 200, parseamos la respuesta
    para saludar al usuario de manera dinámica.
  */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(URL_USUARIOS, usuario);

      // 1. Usamos response.data para obtener el nombre que confirmó el servidor
      // para mostrar un cartel de bienvenido 

      /* 
      const nombreRecibido = response.data.nombre;
      const apellidoRecibido = response.data.apellido;
      */

      // se puede estructurar directamente así:
      const { nombre, apellido } = response.data;

      // 2. Mostramos el mensaje personalizado
      alert(`¡Registro exitoso! Bienvenido/a ${nombre} ${apellido}.`);

      setUsuario(initialState); // aqui limpiamos los datos del formulario
      // si la respuesta es exitosa, redirigimos al usuario a la página de inicio o a donde quieras
      if (response) {
        navigate("/"); // Redirige al usuario a la página de inicio después de crear el mismo
        console.log("Usuario creado exitosamente:", response.data);
      }
    } catch (error) {
    // Intentamos obtener el mensaje de error detallado del backend
      const errorMessage = error.response?.data?.error || "Error desconocido al crear el usuario";
      console.error("Error al crear el usuario:", errorMessage, error);
      alert(`Error de registro: ${errorMessage}`);
    }
  };

  {
    //---------------------------------------------------------
  }

  return (
    <div className="containerUsuario">
      <h2 className="titulo">Carga de datos del Usuario</h2>
      <div className="contenedorFlex">
        <img src={cargaUsuario} alt="Usuario" className="ImgcargaUsuario" />
        <div className="contenedorFormUsuario">
          <Container className="mt-5">
            <Form onSubmit={handleSubmit} autoComplete="off">
              <p className="text-muted mb-3">
                Registrate como usuario comun o usuario profesional segun corresponda.
              </p>
              <p className="leyenda-obligatorio">
                <span className="campo-requerido">*</span> Todos los campos son obligatorios
              </p>
              <div className="contenedorLabel">
                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre <span className="campo-requerido">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nombre"
                        name="nombre"
                        value={usuario.nombre}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Apellido <span className="campo-requerido">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Apellido"
                        name="apellido"
                        value={usuario.apellido}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>DNI <span className="campo-requerido">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="ingresa tu DNI"
                        name="dni"
                        value={usuario.dni}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Email <span className="campo-requerido">*</span></Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="ingresa tu email"
                        name="email"
                        value={usuario.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Dirección <span className="campo-requerido">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="ingresa la dirección"
                        name="direccion"
                        value={usuario.direccion}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Teléfono <span className="campo-requerido">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="ingresa su n° de teléfono"
                        name="telefono"
                        value={usuario.telefono}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Usuario <span className="campo-requerido">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="ingresa el nombre de usuario"
                        name="usuario"
                        value={usuario.usuario}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Contraseña <span className="campo-requerido">*</span></Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="ingresa la contraseña"
                        name="contraseña"
                        value={usuario.contraseña}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                      />
                    </Form.Group>
                  </div>
                </div>
              </div>
              <div className="contenedorBotonRegistro">
                <Button
                  variant="primary"
                  type="submit"
                  style={{
                    width: "180px",
                    height: "46px",
                    fontWeight: "700",
                    borderRadius: "8px",
                    padding: "0",
                    lineHeight: "46px",
                  }}
                >
                  Guardar
                </Button>

                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => navigate(-1)}
                  style={{
                    width: "180px",
                    height: "46px",
                    fontWeight: "700",
                    borderRadius: "8px",
                    padding: "0",
                    lineHeight: "46px",
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </Form>
            <br />
          </Container>
        </div>
      </div>
    </div>
  );
};

export default RegistroUsuario;
