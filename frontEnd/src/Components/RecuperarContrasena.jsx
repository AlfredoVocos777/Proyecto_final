import React, { useState } from 'react';
import "../CSS/LoginUsuario.css";
import Header_1 from "./Header_1";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";

export default function RecuperarContrasena() {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [procesando, setProcesando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcesando(true);
    setMensaje('');
    try {
      const res = await fetch('http://localhost:8000/api/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje('Se envió un correo para recuperar la contraseña.');
      } else {
        setMensaje(data.mensaje || 'Error al enviar correo');
      }
    } catch (err) {
      setMensaje('Error de conexión');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <Header_1 />
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
          Recuperar contraseña
        </p>
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Recuperar contraseña</h2>
          <label style={{width:'100%',textAlign:'left',marginBottom:8}}>Email:</label>
          <input
            className="input-usuario"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn_ingresar" disabled={procesando}>
            {procesando ? 'Enviando...' : 'Enviar'}
          </button>
          <button type="button" className="btn_ingresar" style={{marginTop:10,background:'#aaa'}} onClick={() => navigate(-1)}>
            Atrás
          </button>
          {mensaje && <div style={{marginTop: '1rem', color: 'blue', textAlign:'center'}}>{mensaje}</div>}
        </form>
      </div>
      <Footer />
    </>
  );
}
