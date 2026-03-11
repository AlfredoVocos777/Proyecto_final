import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../CSS/Header.css";

import logoDpa from "../assets/logo_dpa.png";
import logoMinisterio from "../assets/logo_ministerio.png";
import { LOGIN_USUARIO } from "../Routers/router";

const Header_1 = () => {
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("usuarioLogueado");
      if (raw) {
        const u = JSON.parse(raw);
        const nombre = [u?.nombre, u?.apellido].filter(Boolean).join(" ");
        const fallback = u?.usuario || "";
        setDisplayName(nombre || fallback);
        setRole(u?.rol || "Usuario");
      } else {
        setDisplayName("");
        setRole("");
      }
    } catch (e) {
      setDisplayName("");
      setRole("");
    }
  }, []);

  const handleLogout = () => {
    try {
      // Limpiar información de sesión
      localStorage.removeItem("usuarioLogueado");
      // Limpiar estados temporales sensibles
      localStorage.removeItem("expedientePendiente");
      localStorage.removeItem("expedienteFiles");
      localStorage.removeItem("archivosSeleccionados");
      localStorage.removeItem("preference_id");
      localStorage.removeItem("expedienteCreado");
    } catch (e) {
      // noop
    }
    // Redirigir al login
    navigate(LOGIN_USUARIO);
  };

  return (
    <header className="navbar">
      {/* Logo DPA a la izquierda con link */}
      <div className="logoDpa">
        <a href="https://www.dpatuc.gob.ar/" target="_blank" rel="noopener noreferrer">
          <img src={logoDpa} alt="logo_dpa" />
        </a>
      </div>

      {/* Información de usuario logueado */}
      {displayName && (
        <div className="userInfo">
          <span className="userName">{displayName}</span>
          {role && (
            <div className="userMeta">
              <span className="userRole">{role}</span>
              <span className="divider">|</span>
              <span
                className="logoutLink"
                role="link"
                tabIndex={0}
                onClick={handleLogout}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleLogout();
                }}
              >
                Cerrar sesión
              </span>
            </div>
          )}
        </div>
      )}

      {/* Logo Ministerio arriba a la derecha */}
      <div className="logoMinisterio">
        <img src={logoMinisterio} alt="logo_ministerio" />
      </div>
    </header>
  );
};

export default Header_1;
