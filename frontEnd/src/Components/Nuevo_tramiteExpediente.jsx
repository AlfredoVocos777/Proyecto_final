import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL_EXPEDIENTES, URL_SUBIR_DOCUMENTO, URL_NOTIFICACIONES } from "../Constants/endpoints";
import { NUEVO_TRAMITE_PAGO } from "../Routers/router";
import "../CSS/Nuevo_tramiteExpediente.css";

const NuevoTramiteExpediente = () => {
  const navigate = useNavigate();
  const [expediente, setExpediente] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const notificacionEnviada = useRef(false);

  useEffect(() => {
    try {
      const exp = localStorage.getItem("expedienteCreado");
      if (!exp) {
        console.error("No se encontró expediente en localStorage");
        return;
      }

      const expedienteData = JSON.parse(exp);
      console.log("Expediente cargado:", expedienteData);

      if (!expedienteData.id) {
        console.error("El expediente no tiene ID");
        return;
      }

      setExpediente(expedienteData);

      const usr = localStorage.getItem("usuarioLogueado");
      if (usr) {
        const userData = JSON.parse(usr);
        console.log("Usuario cargado:", userData);
        setUsuario(userData);

        // Notificar al presentante por mail (solo una vez)
        if (!notificacionEnviada.current) {
          notificacionEnviada.current = true;
          axios.post(`${URL_NOTIFICACIONES}/notificar-creacion`, {
            email: userData.email,
            nombre: userData.nombre,
            apellido: userData.apellido,
            numero_expediente: expedienteData.numero_expediente,
            tipo_expediente: expedienteData.tipo_expediente,
            id_usuario: userData.id_usuario,
          }).catch(err => console.warn("No se pudo enviar notificación de creación:", err));
        }
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert("Error al cargar los datos del expediente");
      navigate("/Nuevo_tramite");
    }
  }, [navigate]);

  if (!expediente) {
    return (
      <div className="page-container">
        <div className="form-container">
          <p>No hay expediente seleccionado. Vuelve al paso anterior.</p>
          <button
            className="btn-primary"
            onClick={() => navigate("/Nuevo_tramite")}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="form-container">
        <h2 className="form-title">Número de expediente generado con exito</h2>

        <div className="form-container2">
          <label>Número de expediente:</label>
          <div style={{ fontWeight: "bold" }}>
            {expediente.numero_expediente}
          </div>

          <label>Tipo de expediente:</label>
          <div>{expediente.tipo_expediente}</div>

          <label>Usuario:</label>
          <div>{usuario ? `${usuario.nombre} ${usuario.apellido}` : "-"}</div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-primary" onClick={() => navigate("/Portada")}>
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NuevoTramiteExpediente;
