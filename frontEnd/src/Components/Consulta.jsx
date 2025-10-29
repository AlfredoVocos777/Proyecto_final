import { useState, useEffect } from "react";
import axios from "axios";
import { URL_USUARIOS } from "../Constants/endpoints";
import { useNavigate } from "react-router-dom";
//import { HOMEBOARD } from "../Routers/router";
import { Link } from "react-router-dom"; /////////////////////para renderizar al Home

import "../CSS/LoginUsuario.css";
import { PORTADA } from "../Routers/router";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [datos, setDatos] = useState([]);

  const userNavigate = useNavigate();

  // funcion para realizar la peticion

  const getUsuarios = async () => {
    try {
      const response = await axios.get(URL_USUARIOS);
      setDatos(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
    }
  };

  useEffect(() => {
    getUsuarios();
  }, []);

  // funcion que maneja el envio de datos

  const manejarEnvio = (e) => {
    e.preventDefault();
    const usuarioEncontrado = datos.find((user) => user.usuario === usuario && user.contraseña === contraseña);
    if (usuarioEncontrado) {
      alert("Inicio de sesión exitoso");
    // Guardamos los datos del usuario en el localStorage
      localStorage.setItem("usuarioLogueado", JSON.stringify(usuarioEncontrado));
      userNavigate(PORTADA);
    } else {
      alert("Usuario o contraseña incorrectos");
    }
    // Aqui se compara con los datos obtenidos en getusuarios()
  };
  return (
    <div className="login-container">
      <form className="login-form" onSubmit={manejarEnvio}>
        <h2>Iniciar sesión</h2>
        <div>
          <input className="input-usuario"
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
        </div>
        <div>
          <input className="input-password"
            type="password"
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn_ingresar">Ingresar</button>
      </form>
      <div className="crear-cuenta">
      <p>¿No tienes una cuenta?</p>
      <Link to="/Registro_usuario" className="link-crear-cuenta">Crear cuenta</Link>
    </div>
    </div>
    
  );
}
export default Login;
