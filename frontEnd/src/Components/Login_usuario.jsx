import { useState, useEffect } from "react";
import axios from "axios";
import { URL_LOGIN, URL_ROLES } from "../Constants/endpoints";
import { useNavigate } from "react-router-dom";
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
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");

  const userNavigate = useNavigate();

  // ya no traemos todos los usuarios; usamos el endpoint de login del backend

  // funcion que maneja el envio de datos

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // 1) Login
      const resp = await axios.post(URL_LOGIN, { usuario, contraseña });
      const datosUsuario = resp.data.usuario;

      // 2) Obtener rol desde la tabla roles usando id_rol
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

      alert("Inicio de sesión exitoso");

      // 4) Redirección según rol (tablas). Fallback a tipo_usuario.
      const rolLower = (rolNombre || "").toLowerCase();
      const tipoLower = (datosUsuario?.tipo_usuario || "").toLowerCase();

      if (
        ["administrativo", "admin ti"].includes(rolLower) ||
        ["administrativo", "avanzado"].includes(tipoLower)
      ) {
        userNavigate(PORTADA_ADMINISTRATIVO);
        return;
      }

      // Redirección específica según rol
      if (
        ["técnico", "tecnico"].includes(rolLower) ||
        tipoLower === "tecnico"
      ) {
        userNavigate(USUARIO_TECNICO);
        return;
      }
      if (
        ["jurídico", "juridico"].includes(rolLower) ||
        tipoLower === "juridico"
      ) {
        userNavigate(USUARIO_JURIDICO);
        return;
      }
      if (rolLower === "director") {
        userNavigate(USUARIO_DIRECTOR);
        return;
      }

      // Fallback a portada general
      userNavigate(PORTADA);
    } catch (err) {
      const msg =
        err.response?.data?.error || "Usuario o contraseña incorrectos";
      setError(msg);
      alert(msg);
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
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
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
    </div>
  );
}
export default Login_usuario;
