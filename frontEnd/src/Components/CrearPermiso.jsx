import { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { URL_PERMISOS } from "../Constants/endpoints";
import { useNavigate } from "react-router-dom";

export default function CrearPermiso() {
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const onSubmit = async (e) => {
    e.preventDefault();
    setOk(""); setErr("");
    try {
      await axios.post(URL_PERMISOS, form);
      setOk("Permiso creado exitosamente");
      setForm({ nombre: "", descripcion: "" });
      
      setTimeout(() => {
        navigate("/PortadaAdministrativo");
      }, 2000);
    } catch (error) {
      setErr(error.response?.data?.error || "Error al crear permiso");
    }
  };
  
  return (
    <Container className="mt-5 mb-5" style={{ maxWidth: 700 }}>
      <h2 className="text-center mb-4">Crear Nuevo Permiso</h2>
      {ok && <Alert variant="success">{ok}</Alert>}
      {err && <Alert variant="danger">{err}</Alert>}
      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nombre del Permiso *</Form.Label>
          <Form.Control 
            name="nombre" 
            placeholder="Ej: crear_usuario, ver_reportes, editar_expediente"
            value={form.nombre} 
            onChange={onChange} 
            required 
          />
          <Form.Text className="text-muted">
            Usa minúsculas y guiones bajos. Ej: crear_usuario, editar_documento
          </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            name="descripcion" 
            placeholder="Describe qué permite hacer este permiso..."
            value={form.descripcion} 
            onChange={onChange} 
          />
        </Form.Group>
        <div className="d-flex gap-2">
          <Button type="submit" variant="primary" className="flex-grow-1">
            Crear Permiso
          </Button>
          <Button variant="secondary" onClick={() => navigate("/PortadaAdministrativo")}>
            Cancelar
          </Button>
        </div>
      </Form>
    </Container>
  );
}
