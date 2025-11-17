import { useEffect, useState } from "react";
import { Table, Button, Modal, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL_USUARIOS } from "../Constants/endpoints";
import { REGISTRO_USUARIO } from "../Routers/router";

export default function ListarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const navigate = useNavigate();

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const { data } = await axios.get(URL_USUARIOS);
      setUsuarios(data);
      setError("");
    } catch (e) {
      console.error("Error al cargar usuarios", e);
      setError("Error al cargar usuarios");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const confirmarEliminacion = (user) => {
    setUsuarioAEliminar(user);
    setMostrarModal(true);
  };

  const eliminarUsuario = async () => {
    if (!usuarioAEliminar) return;
    try {
      await axios.delete(`${URL_USUARIOS}/${usuarioAEliminar.id_usuario}`);
      setMostrarModal(false);
      setUsuarioAEliminar(null);
      cargarUsuarios();
    } catch (e) {
      console.error("Error al eliminar usuario", e);
      setError("No se pudo eliminar el usuario. Puede tener datos asociados.");
      setMostrarModal(false);
    }
  };

  const cancelarEliminacion = () => {
    setMostrarModal(false);
    setUsuarioAEliminar(null);
  };

  if (cargando) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Usuarios</h2>
        <Button variant="primary" onClick={() => navigate(REGISTRO_USUARIO)}>
          + Crear Usuario
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="roles-table-scroll">
        <Table striped bordered hover responsive size="sm">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">No hay usuarios registrados</td>
              </tr>
            ) : (
              usuarios.map(u => (
                <tr key={u.id_usuario}>
                  <td>{u.id_usuario}</td>
                  <td>{u.usuario}</td>
                  <td>{u.nombre} {u.apellido}</td>
                  <td>{u.email}</td>
                  <td>{u.tipo_usuario}</td>
                  <td>{u.rol || '-'}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/EditarUsuario/${u.id_usuario}`)}>
                        Editar
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => confirmarEliminacion(u)}>
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <Modal show={mostrarModal} onHide={cancelarEliminacion}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Eliminar al usuario <strong>{usuarioAEliminar?.usuario}</strong>?
          <br />
          <small className="text-muted">Esta acción no se puede deshacer.</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelarEliminacion}>Cancelar</Button>
          <Button variant="danger" onClick={eliminarUsuario}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
