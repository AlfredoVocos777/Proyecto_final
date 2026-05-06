import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LOGIN_USUARIO, PORTADA } from "./router";

export const RequireAuth = ({ children }) => {
  const location = useLocation();
  const raw = localStorage.getItem("usuarioLogueado");
  if (!raw) {
    return <Navigate to={LOGIN_USUARIO} replace state={{ from: location }} />;
  }
  return children;
};

export const RequireAdmin = ({ children }) => {
  const location = useLocation();
  const raw = localStorage.getItem("usuarioLogueado");
  if (!raw) {
    return <Navigate to={LOGIN_USUARIO} replace state={{ from: location }} />;
  }
  let tipo = "";
  let rol = "";
  try {
    const u = JSON.parse(raw);
    tipo = (u?.tipo_usuario || "").toLowerCase();
    rol = (u?.rol || "").toLowerCase();
  } catch (e) {
    // si falla el parseo, forzamos a login
    return <Navigate to={LOGIN_USUARIO} replace state={{ from: location }} />;
  }
  const isAdminByRol = ["administrativo", "director"].includes(rol);
  const isAdminByTipo = ["administrativo", "avanzado"].includes(tipo);
  if (!isAdminByRol && !isAdminByTipo) {
    return <Navigate to={PORTADA} replace />;
  }
  return children;
};

export const RequireTecnico = ({ children }) => {
  const location = useLocation();
  const raw = localStorage.getItem("usuarioLogueado");
  if (!raw) {
    return <Navigate to={LOGIN_USUARIO} replace state={{ from: location }} />;
  }
  let tipo = "";
  let rol = "";
  try {
    const u = JSON.parse(raw);
    tipo = (u?.tipo_usuario || "").toLowerCase();
    rol = (u?.rol || "").toLowerCase();
  } catch (e) {
    return <Navigate to={LOGIN_USUARIO} replace state={{ from: location }} />;
  }
  const isTecnicoByRol = ["técnico", "tecnico"].includes(rol);
  const isTecnicoByTipo = ["tecnico"].includes(tipo);
  if (!isTecnicoByRol && !isTecnicoByTipo) {
    return <Navigate to={PORTADA} replace />;
  }
  return children;
};

export const RequireJuridico = ({ children }) => {
  const location = useLocation();
  const raw = localStorage.getItem("usuarioLogueado");
  if (!raw) {
    return <Navigate to={LOGIN_USUARIO} replace state={{ from: location }} />;
  }
  let tipo = "";
  let rol = "";
  try {
    const u = JSON.parse(raw);
    tipo = (u?.tipo_usuario || "").toLowerCase();
    rol = (u?.rol || "").toLowerCase();
  } catch (e) {
    return <Navigate to={LOGIN_USUARIO} replace state={{ from: location }} />;
  }
  const isJuridicoByRol = ["jurídico", "juridico"].includes(rol);
  const isJuridicoByTipo = ["juridico"].includes(tipo);
  if (!isJuridicoByRol && !isJuridicoByTipo) {
    return <Navigate to={PORTADA} replace />;
  }
  return children;
};

export const RequireDirector = ({ children }) => {
  const location = useLocation();
  const raw = localStorage.getItem("usuarioLogueado");
  if (!raw) {
    return <Navigate to={LOGIN_USUARIO} replace state={{ from: location }} />;
  }
  let tipo = "";
  let rol = "";
  try {
    const u = JSON.parse(raw);
    tipo = (u?.tipo_usuario || "").toLowerCase();
    rol = (u?.rol || "").toLowerCase();
  } catch (e) {
    return <Navigate to={LOGIN_USUARIO} replace state={{ from: location }} />;
  }
  const isDirectorByRol = ["director"].includes(rol);
  const isDirectorByTipo = ["director"].includes(tipo);
  if (!isDirectorByRol && !isDirectorByTipo) {
    return <Navigate to={PORTADA} replace />;
  }
  return children;
};

export default {};
