import { useState, useEffect } from "react";
import axios from "axios";
import { URL_LOGIN, URL_ROLES } from "../Constants/endpoints";
import { useNavigate } from "react-router-dom";
import { Alert } from "react-bootstrap";
//import { HOMEBOARD } from "../Routers/router";
import { Link } from "react-router-dom"; /////////////////////para renderizar al Home

import "../CSS/LoginUsuario.css";
import {
  PORTADA,
  PORTADA_ADMINISTRATIVO,
  USUARIO_TECNICO,
  USUARIO_JURIDICO,
  USUARIO_DIRECTOR,
} from "../Routers/router";

function Login_usuario() {
    /*
      BLOQUE 1: DEPURACIÓN INICIAL
      El useEffect vacío '[]' se ejecuta solo una vez cuando la página de Login se abre.
      Borramos cualquier usuario guardado previamente en el caché (localStorage) 
      para evitar que un nuevo usuario inicie sesión sobre los datos de un usuario anterior.
    */
    useEffect(() => {
      localStorage.removeItem("usuarioLogueado");
    }, []);
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  const userNavigate = useNavigate();

  // ya no traemos todos los usuarios; usamos el endpoint de login del backend

  // funcion que maneja el envio de datos

  /*
    BLOQUE 2: LÓGICA CORE DEL ACCESO
    Aquí capturamos el evento 'submit' del formulario enviando el usuario y contraseña hacia el Backend.
  */
  const manejarEnvio = async (e) => {
    e.preventDefault(); // Evita que la página intente "recargarse" de manera nativa
    setError("");
    try {
      // 1) Login: Hacemos Fetch a nuestra API
      const resp = await axios.post(URL_LOGIN, { usuario, contraseña });
      const datosUsuario = resp.data.usuario;

      // 2) Obtener rol desde la tabla roles usando su id_rol en la BD
      const idRol = datosUsuario?.id_rol;
      if (!idRol) {
        setError(
          "El usuario no tiene un rol asignado. Contacte al administrador."
        );
        return;
      }

      let rolNombre = "";
      let permisos = [];
      try {
        const rolResp = await axios.get(`${URL_ROLES}/${idRol}`);
        rolNombre = rolResp?.data?.nombre || "";
        permisos = rolResp?.data?.permisos || [];
      } catch (e) {
        // Si falla, seguimos con tipo_usuario como respaldo
        rolNombre = datosUsuario?.rol || "";
      }

      // 3) Guardar en localStorage con rol y permisos
      const usuarioCompleto = {
        ...datosUsuario,
        rol: rolNombre,
        permisos,
      };
      localStorage.setItem("usuarioLogueado", JSON.stringify(usuarioCompleto));

      setExito(true);

      // Redirigir después de 1.5 segundos para que se vea el mensaje
      /*
        BLOQUE 3: REDIRECCIÓN DINÁMICA POR ROL
        Revisamos en qué categoría cayó el usuario (Admin, Técnico, Jurídico)
        y lo mandamos específicamente a su propia bandeja de entrada correspondiente.
        Esto previene que un Alumno vea las herramientas de un Director.
      */
      setTimeout(() => {
        // Redirección según el nombre del rol...
        const rolLower = (rolNombre || "").toLowerCase();

        if (["administrativo"].includes(rolLower)) {
          userNavigate(PORTADA_ADMINISTRATIVO);
          return;
        }

        if (["técnico", "tecnico"].includes(rolLower)) {
          userNavigate(USUARIO_TECNICO);
          return;
        }

        if (["jurídico", "juridico"].includes(rolLower)) {
          userNavigate(USUARIO_JURIDICO);
          return;
        }

        if (rolLower === "director") {
          userNavigate(USUARIO_DIRECTOR);
          return;
        }

        // Fallback a portada general (Presentante u otros)
        userNavigate(PORTADA);
      }, 1500);
    } catch (err) {
      const msg =
        err.response?.data?.error || "Usuario o contraseña incorrectos";
      setError(msg);
      setExito(false);
    }
  };
  return (
    <div className="login-container">
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          marginBottom: "30px",
          textAlign: "center",
          color: "#2c3e50",
        }}
      >
        SIGEDEX
      </h1>
      <p
        style={{
          fontSize: "16px",
          marginBottom: "25px",
          textAlign: "center",
          color: "#555",
        }}
      >
        Sistema de Gestión de Expedientes Digitales
      </p>
      <form className="login-form" onSubmit={manejarEnvio}>
        <h2>Iniciar sesión</h2>
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
        {exito && <Alert variant="success" className="mb-3">¡Inicio de sesión exitoso! Redirigiendo...</Alert>}
        <div>
          <input
            className="input-usuario"
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            className="input-password"
            type="password"
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn_ingresar">
          Ingresar
        </button>
      </form>
      <div className="crear-cuenta">
        <p>¿No tienes una cuenta?</p>
        <Link to="/Registro_usuario" className="link-crear-cuenta">
          Crear cuenta
        </Link>
      </div>
      <div className="recuperar-contrasena">
        <Link to="/recuperar-contrasena" className="link-recuperar-contrasena">
          Recuperar contraseña
        </Link>
      </div>
    </div>
  );
}
export default Login_usuario;
