import { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { URL_DEPARTAMENTOS } from "../Constants/endpoints";
import { useNavigate } from "react-router-dom";

export default function CrearDepartamento() {
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const onSubmit = async (e) => {
    e.preventDefault();
    setOk(""); setErr("");
    try {
      await axios.post(URL_DEPARTAMENTOS, form);
      setOk("Departamento creado exitosamente");
      setForm({ nombre: "", descripcion: "" });
      
      setTimeout(() => {
        navigate("/PortadaAdministrativo");
      }, 2000);
    } catch (error) {
      setErr(error.response?.data?.error || "Error al crear departamento");
    }
  };
  
  return (
    <Container className="mt-5 mb-5" style={{ maxWidth: 700 }}>
      <h2 className="text-center mb-4">Crear Nuevo Departamento</h2>
      {ok && <Alert variant="success">{ok}</Alert>}
      {err && <Alert variant="danger">{err}</Alert>}
      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nombre del Departamento *</Form.Label>
          <Form.Control 
            name="nombre" 
            placeholder="Ej: Recursos Hídricos, Administración, Obras"
            value={form.nombre} 
            onChange={onChange} 
            required 
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            name="descripcion" 
            placeholder="Describe las funciones de este departamento..."
            value={form.descripcion} 
            onChange={onChange} 
          />
        </Form.Group>
        <div className="d-flex gap-2">
          <Button type="submit" variant="primary" className="flex-grow-1">
            Crear Departamento
          </Button>
          <Button variant="secondary" onClick={() => navigate("/PortadaAdministrativo")}>
            Cancelar
          </Button>
        </div>
      </Form>
    </Container>
  );
}
