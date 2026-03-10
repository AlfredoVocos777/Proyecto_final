import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ResetPassword() {
  const { token } = useParams();
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [procesando, setProcesando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcesando(true);
    setMensaje('');
    try {
      const res = await fetch('http://localhost:8000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nuevaContrasena })
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje('Contraseña actualizada correctamente.');
      } else {
        setMensaje(data.mensaje || 'Error al actualizar contraseña');
      }
    } catch (err) {
      setMensaje('Error de conexión');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div style={{maxWidth: 350, margin: 'auto', padding: '2rem'}}>
      <h3>Restablecer contraseña</h3>
      <form onSubmit={handleSubmit}>
        <label>Nueva contraseña:</label>
        <input
          type="password"
          value={nuevaContrasena}
          onChange={e => setNuevaContrasena(e.target.value)}
          required
          style={{width: '100%', marginBottom: '1rem'}}
        />
        <button type="submit" disabled={procesando} style={{width: '100%'}}>
          {procesando ? 'Actualizando...' : 'Actualizar'}
        </button>
      </form>
      {mensaje && <div style={{marginTop: '1rem', color: 'blue'}}>{mensaje}</div>}
    </div>
  );
}
