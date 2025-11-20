import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  NUEVO_TRAMITE_DATOS,
  CONSULTA_ADMIN,
  LISTAR_ROLES,
  LISTAR_PERMISOS,
  LISTAR_DEPARTAMENTOS,
  LISTAR_FIRMAS,
  LISTAR_USUARIOS,
  PORTADA,
  LOGIN_USUARIO,
  EXPEDIENTES_FINALIZADOS,
  EXPEDIENTES_ARCHIVADOS,
} from "../Routers/router";
import "../CSS/PortadaAdministrativo.css";

const PortadaAdministrativo = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("usuarioLogueado");
    if (!raw) {
      navigate(LOGIN_USUARIO);
      return;
    }
    try {
      const tipo = (JSON.parse(raw)?.tipo_usuario || "").toLowerCase();
      if (tipo !== "administrativo" && tipo !== "avanzado") {
        navigate(PORTADA);
        return;
      }
      setReady(true);
    } catch (e) {
      navigate(LOGIN_USUARIO);
    }
  }, [navigate]);

  if (!ready) return null;

  return (
    <div className="admin-hero">
      <div className="admin-wrap">
        <h1 className="admin-title">Dirección Provincial del Agua</h1>
        <p className="admin-subtitle">SIGEDEX · Panel administrativo</p>

        <div className="admin-card">
          <div className="admin-actions">
            <button className="admin-btn primary" onClick={() => navigate(NUEVO_TRAMITE_DATOS)}>
              Crear Nuevo Trámite
            </button>
            <button className="admin-btn info" onClick={() => navigate(CONSULTA_ADMIN)}>
              Consultar y Asignar Expedientes
            </button>
            <button className="admin-btn success" onClick={() => navigate(LISTAR_USUARIOS)}>
              Gestionar Usuarios
            </button>
            <button className="admin-btn warn" onClick={() => navigate(LISTAR_ROLES)}>
              Gestionar Roles
            </button>
            <button className="admin-btn danger" onClick={() => navigate(LISTAR_PERMISOS)}>
              Gestionar Permisos
            </button>
            <button className="admin-btn muted" onClick={() => navigate(LISTAR_DEPARTAMENTOS)}>
              Gestionar Departamentos
            </button>
            <button className="admin-btn dark" onClick={() => navigate(LISTAR_FIRMAS)}>
              Gestionar Firmas
            </button>
            <button className="admin-btn finalizados" onClick={() => navigate(EXPEDIENTES_FINALIZADOS)}>
              Expedientes Finalizados
            </button>
            <button className="admin-btn archivados" onClick={() => navigate(EXPEDIENTES_ARCHIVADOS)}>
              Expedientes Archivados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortadaAdministrativo;
