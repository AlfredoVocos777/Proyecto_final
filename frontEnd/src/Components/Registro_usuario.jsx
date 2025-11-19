import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL_USUARIOS, URL_ROLES, URL_DEPARTAMENTOS } from "../Constants/endpoints";
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
    id_rol: 1, // Rol por defecto: Presentante (asumiendo id_rol=1)
    id_departamento: null,
  };
  const [usuario, setUsuario] = useState(initialState);
  const [roles, setRoles] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);

  // Cargar roles y departamentos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [rolesRes, deptoRes] = await Promise.all([
          axios.get(URL_ROLES),
          axios.get(URL_DEPARTAMENTOS)
        ]);
        setRoles(rolesRes.data || []);
        setDepartamentos(deptoRes.data || []);
      } catch (error) {
        console.error("Error al cargar roles o departamentos:", error);
      }
    };
    cargarDatos();
  }, []);

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
                  controlId="exampleForm.ControlTextarea1"
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
                    type="password"
                    placeholder="ingresa la contraseña"
                    name="contraseña"
                    value={usuario.contraseña}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlTextarea2"
                >
                  <Form.Label>Rol</Form.Label>
                  <Form.Select
                    name="id_rol"
                    value={usuario.id_rol || ''}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar rol</option>
                    {roles.map(r => (
                      <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlTextarea3"
                >
                  <Form.Label>Departamento (opcional)</Form.Label>
                  <Form.Select
                    name="id_departamento"
                    value={usuario.id_departamento || ''}
                    onChange={handleChange}
                  >
                    <option value="">Sin departamento</option>
                    {departamentos.map(d => (
                      <option key={d.id_departamento} value={d.id_departamento}>{d.nombre}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="contenedorBotonRegistro">
                <Button
                  size="sm"
                  className="btnRegistro"
                  variant="primary"
                  type="submit"
                  
                >
                  Guardar
                </Button>

                <Button
                  size="sm"
                  className="btnRegistro"
                  variant="secondary"
                  type="button"
                  onClick={() => navigate(-1)}
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
