import { useState, useEffect } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { URL_ROLES, URL_PERMISOS } from "../Constants/endpoints";
import { useNavigate } from "react-router-dom";

export default function CrearRol() {
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [permisos, setPermisos] = useState([]);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    cargarPermisos();
  }, []);

  const cargarPermisos = async () => {
    try {
      const response = await axios.get(URL_PERMISOS);
      setPermisos(response.data);
    } catch (error) {
      console.error("Error al cargar permisos:", error);
    }
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePermisoChange = (idPermiso) => {
    if (permisosSeleccionados.includes(idPermiso)) {
      setPermisosSeleccionados(permisosSeleccionados.filter(id => id !== idPermiso));
    } else {
      setPermisosSeleccionados([...permisosSeleccionados, idPermiso]);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setOk(""); setErr("");
    try {
      const nuevoRol = {
        ...form,
        permisos: permisosSeleccionados
      };
      await axios.post(URL_ROLES, nuevoRol);
      setOk("Rol creado exitosamente");
      setForm({ nombre: "", descripcion: "" });
      setPermisosSeleccionados([]);
      
      setTimeout(() => {
        navigate("/PortadaAdministrativo");
      }, 2000);
    } catch (error) {
      setErr(error.response?.data?.error || "Error al crear rol");
    }
  };

  return (
    <Container className="mt-5 mb-5" style={{ maxWidth: 700 }}>
      <h2 className="text-center mb-4">Crear Nuevo Rol</h2>
      {ok && <Alert variant="success">{ok}</Alert>}
      {err && <Alert variant="danger">{err}</Alert>}
      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nombre del Rol *</Form.Label>
          <Form.Control 
            name="nombre" 
            placeholder="Ej: Administrativo, Supervisor, Usuario"
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
            placeholder="Descripción del rol..."
            value={form.descripcion} 
            onChange={onChange} 
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Permisos Asignados</Form.Label>
          {permisos.length === 0 ? (
            <p className="text-muted">No hay permisos disponibles. Crea permisos primero.</p>
          ) : (
            <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #dee2e6", borderRadius: "5px", padding: "10px", backgroundColor: "#f8f9fa" }}>
              {permisos.map((permiso) => (
                <Form.Check
                  key={permiso.id_permiso}
                  type="checkbox"
                  id={`permiso-${permiso.id_permiso}`}
                  label={`${permiso.nombre_permiso}${permiso.descripcion ? ' - ' + permiso.descripcion : ''}`}
                  checked={permisosSeleccionados.includes(permiso.id_permiso)}
                  onChange={() => handlePermisoChange(permiso.id_permiso)}
                  className="mb-2"
                />
              ))}
            </div>
          )}
        </Form.Group>

        <div className="d-flex gap-2">
          <Button type="submit" variant="primary" className="flex-grow-1">
            Crear Rol
          </Button>
          <Button variant="secondary" onClick={() => navigate("/PortadaAdministrativo")}>
            Cancelar
          </Button>
        </div>
      </Form>
    </Container>
  );
}
