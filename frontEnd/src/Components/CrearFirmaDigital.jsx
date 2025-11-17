import { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Row, Col } from "react-bootstrap";
import axios from "axios";
import { URL_FIRMAS, URL_EXPEDIENTES, URL_USUARIOS } from "../Constants/endpoints";
import { useNavigate } from "react-router-dom";

export default function CrearFirmaDigital() {
  const [form, setForm] = useState({ id_expediente: "", id_usuario: "", hash_documento: "", metodo_firma: "SHA256" });
  const [expedientes, setExpedientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resExpedientes, resUsuarios] = await Promise.all([
        axios.get(URL_EXPEDIENTES),
        axios.get(URL_USUARIOS)
      ]);
      setExpedientes(resExpedientes.data);
      setUsuarios(resUsuarios.data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const onSubmit = async (e) => {
    e.preventDefault();
    setOk(""); setErr("");
    try {
      await axios.post(URL_FIRMAS, {
        ...form,
        id_expediente: form.id_expediente ? Number(form.id_expediente) : undefined,
        id_usuario: form.id_usuario ? Number(form.id_usuario) : undefined,
      });
      setOk("Firma digital creada exitosamente");
      setForm({ id_expediente: "", id_usuario: "", hash_documento: "", metodo_firma: "SHA256" });
      
      setTimeout(() => {
        navigate("/PortadaAdministrativo");
      }, 2000);
    } catch (error) {
      setErr(error.response?.data?.error || "Error al crear firma digital");
    }
  };

  return (
    <Container className="mt-5 mb-5" style={{ maxWidth: 800 }}>
      <h2 className="text-center mb-4">Crear Firma Digital</h2>
      {ok && <Alert variant="success">{ok}</Alert>}
      {err && <Alert variant="danger">{err}</Alert>}
      <Form onSubmit={onSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Expediente *</Form.Label>
              <Form.Select 
                name="id_expediente" 
                value={form.id_expediente} 
                onChange={onChange} 
                required
              >
                <option value="">Seleccione un expediente</option>
                {expedientes.map((exp) => (
                  <option key={exp.id_expediente} value={exp.id_expediente}>
                    {exp.numero_expediente} - {exp.asunto}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Usuario Firmante *</Form.Label>
              <Form.Select 
                name="id_usuario" 
                value={form.id_usuario} 
                onChange={onChange} 
                required
              >
                <option value="">Seleccione un usuario</option>
                {usuarios.map((user) => (
                  <option key={user.id_usuario} value={user.id_usuario}>
                    {user.nombre} {user.apellido} ({user.usuario})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3">
          <Form.Label>Hash del Documento</Form.Label>
          <Form.Control 
            name="hash_documento" 
            placeholder="Hash SHA256 del documento"
            value={form.hash_documento} 
            onChange={onChange} 
          />
          <Form.Text className="text-muted">
            Se puede generar automáticamente al momento de la firma
          </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Método de Firma</Form.Label>
          <Form.Select name="metodo_firma" value={form.metodo_firma} onChange={onChange}>
            <option value="SHA256">SHA256</option>
            <option value="RSA">RSA</option>
            <option value="ECDSA">ECDSA</option>
          </Form.Select>
        </Form.Group>
        <div className="d-flex gap-2">
          <Button type="submit" variant="primary" className="flex-grow-1">
            Crear Firma Digital
          </Button>
          <Button variant="secondary" onClick={() => navigate("/PortadaAdministrativo")}>
            Cancelar
          </Button>
        </div>
      </Form>
    </Container>
  );
}
