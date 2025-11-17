import { useState, useEffect } from "react";
import { Table, Button, Modal, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL_ROLES } from "../Constants/endpoints";
import { CREAR_ROL } from "../Routers/router";

const ListarRoles = () => {
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [rolAEliminar, setRolAEliminar] = useState(null);
  const navigate = useNavigate();

  const cargarRoles = async () => {
    try {
      setCargando(true);
      const response = await axios.get(URL_ROLES);
      setRoles(response.data);
      setError("");
    } catch (err) {
      console.error("Error al cargar roles:", err);
      setError("Error al cargar los roles");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarRoles();
  }, []);

  const confirmarEliminacion = (rol) => {
    setRolAEliminar(rol);
    setMostrarModal(true);
  };

  const eliminarRol = async () => {
    if (!rolAEliminar) return;

    try {
      await axios.delete(`${URL_ROLES}/${rolAEliminar.id_rol}`);
      setMostrarModal(false);
      setRolAEliminar(null);
      cargarRoles(); // Recargar la lista
    } catch (err) {
      console.error("Error al eliminar rol:", err);
      setError("Error al eliminar el rol. Puede que tenga usuarios asociados.");
      setMostrarModal(false);
    }
  };

  const cancelarEliminacion = () => {
    setMostrarModal(false);
    setRolAEliminar(null);
  };

  if (cargando) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando roles...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Roles</h2>
        <Button variant="primary" onClick={() => navigate(CREAR_ROL)}>
          + Crear Nuevo Rol
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Limitar altura para que el botón Volver quede más cerca y el contenido no se pierda bajo scroll largo */}
      <div className="roles-table-scroll">
      <Table striped bordered hover responsive size="sm">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {roles.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">
                No hay roles registrados
              </td>
            </tr>
          ) : (
            roles.map((rol) => (
              <tr key={rol.id_rol}>
                <td>{rol.id_rol}</td>
                <td>{rol.nombre}</td>
                <td>{rol.descripcion || "-"}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => confirmarEliminacion(rol)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      </div>

      {/* Modal de confirmación */}
      <Modal show={mostrarModal} onHide={cancelarEliminacion}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Está seguro que desea eliminar el rol <strong>{rolAEliminar?.nombre}</strong>?
          <br />
          <small className="text-muted">Esta acción no se puede deshacer.</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelarEliminacion}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={eliminarRol}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ListarRoles;
