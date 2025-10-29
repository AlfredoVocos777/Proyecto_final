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

  {
    //---------------------------------------------------------
  }
  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };
  {
    //---------------------------------------------------------
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(URL_USUARIOS, usuario);
      setUsuario(response.data);

      setUsuario(initialState); // aqui limpiamos los datos del formulario, para ello deb
      if (response) {
        navigate("/"); // Redirige al usuario a la página de inicio después de crear el mismo
        console.log("Usuario creado exitosamente:", response.data);
      }
    } catch (error) {
      console.error("Error al crear el usuario:", error);
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
            <Form onSubmit={handleSubmit}>
              <div className="contenedorLabel">
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlInput1"
                >
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nombre"
                    name="nombre"
                    value={usuario.nombre}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlInput1"
                >
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Apellido"
                    name="apellido"
                    value={usuario.apellido}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlTextareal"
                >
                  <Form.Label>DNI</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="ingresa tu DNI"
                    name="dni"
                    value={usuario.dni}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlTextarea1"
                >
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="ingresa tu email"
                    name="email"
                    value={usuario.email}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlTextarea1"
                >
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="ingresa la direccíon"
                    name="direccion"
                    value={usuario.direccion}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlTextarea1"
                >
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="ingresa su n° de teléfono"
                    name="telefono"
                    value={usuario.telefono}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlTextarea1"
                >
                  <Form.Label>Usuario</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="ingresa el nombre de usuario"
                    name="usuario"
                    value={usuario.usuario}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlTextarea1"
                >
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="ingresa la contraseña"
                    name="contraseña"
                    value={usuario.contraseña}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>
              <div className="contenedorBoton">
                <Button
                  size="sm"
                  className="btn-guardar"
                  variant="primary"
                  type="submit"
                  onClick={() => navigate("/")}
                >
                  Guardar
                </Button>

                <Button
                  size="sm"
                  className="btn-cancelar"
                  variant="secondary"
                  type="button"
                  onClick={() => navigate("/")}
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
