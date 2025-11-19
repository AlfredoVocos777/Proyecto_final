import { useState, useEffect } from "react";
import { Table, Button, Modal, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL_PERMISOS } from "../Constants/endpoints";
import { CREAR_PERMISO, PORTADA_ADMINISTRATIVO } from "../Routers/router";

const ListarPermisos = () => {
  const [permisos, setPermisos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [permisoAEliminar, setPermisoAEliminar] = useState(null);
  const navigate = useNavigate();

  const cargarPermisos = async () => {
    try {
      setCargando(true);
      const response = await axios.get(URL_PERMISOS);
      setPermisos(response.data);
      setError("");
    } catch (err) {
      console.error("Error al cargar permisos:", err);
      setError("Error al cargar los permisos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPermisos();
  }, []);

  const confirmarEliminacion = (permiso) => {
    setPermisoAEliminar(permiso);
    setMostrarModal(true);
  };

  const eliminarPermiso = async () => {
    if (!permisoAEliminar) return;

    try {
      await axios.delete(`${URL_PERMISOS}/${permisoAEliminar.id_permiso}`);
      setMostrarModal(false);
      setPermisoAEliminar(null);
      cargarPermisos();
    } catch (err) {
      console.error("Error al eliminar permiso:", err);
      setError("Error al eliminar el permiso. Puede que esté asignado a roles.");
      setMostrarModal(false);
    }
  };

  const cancelarEliminacion = () => {
    setMostrarModal(false);
    setPermisoAEliminar(null);
  };

  if (cargando) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando permisos...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Permisos</h2>
        <Button variant="primary" size="md" onClick={() => navigate(CREAR_PERMISO)}>
          + Crear Nuevo Permiso
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {permisos.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">
                No hay permisos registrados
              </td>
            </tr>
          ) : (
            permisos.map((permiso) => (
              <tr key={permiso.id_permiso}>
                <td>{permiso.id_permiso}</td>
                <td>{permiso.nombre}</td>
                <td>{permiso.descripcion || "-"}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => confirmarEliminacion(permiso)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Modal show={mostrarModal} onHide={cancelarEliminacion}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Está seguro que desea eliminar el permiso <strong>{permisoAEliminar?.nombre}</strong>?
          <br />
          <small className="text-muted">Esta acción no se puede deshacer.</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelarEliminacion}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={eliminarPermiso}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="mt-4">
        <Button 
          variant="outline-secondary"
          size="md"
          onClick={() => navigate(PORTADA_ADMINISTRATIVO)}
          title="Volver a la portada administrativa"
        >
          ← Volver
        </Button>
      </div>
    </div>
  );
};

export default ListarPermisos;
