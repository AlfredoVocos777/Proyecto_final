import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header_1 from "../Components/Header_1";
import Footer from "../Components/Footer";
import "../CSS/LoginUsuario.css";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    if (nuevaContrasena !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (nuevaContrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setProcesando(true);
    try {
      const res = await fetch("http://localhost:8000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, nuevaContrasena }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje("Contraseña actualizada correctamente. Podés iniciar sesión.");
        setTimeout(() => navigate("/Login_usuario"), 2500);
      } else {
        setError(data.mensaje || "Error al actualizar la contraseña.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <Header_1 />
      <div className="login-container">
        <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "30px", textAlign: "center", color: "#2c3e50" }}>
          SIGEDEX
        </h1>
        <p style={{ fontSize: "16px", marginBottom: "25px", textAlign: "center", color: "#555" }}>
          Restablecer contraseña
        </p>
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Nueva contraseña</h2>
          <label style={{ width: "100%", textAlign: "left", marginBottom: 8 }}>Nueva contraseña:</label>
          <input
            className="input-usuario"
            type="password"
            value={nuevaContrasena}
            onChange={(e) => setNuevaContrasena(e.target.value)}
            required
            minLength={6}
          />
          <label style={{ width: "100%", textAlign: "left", marginBottom: 8, marginTop: 12 }}>Confirmar contraseña:</label>
          <input
            className="input-usuario"
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit" className="btn_ingresar" disabled={procesando} style={{ marginTop: 16 }}>
            {procesando ? "Guardando..." : "Cambiar contraseña"}
          </button>
          {mensaje && <div style={{ marginTop: "1rem", color: "green", textAlign: "center" }}>{mensaje}</div>}
          {error && <div style={{ marginTop: "1rem", color: "red", textAlign: "center" }}>{error}</div>}
        </form>
      </div>
      <Footer />
    </>
  );
}
