import { useEffect, useState } from "react";
import { Table, Button, Modal, Alert, Spinner, Pagination } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL_USUARIOS } from "../Constants/endpoints";
import { REGISTRO_USUARIO, PORTADA_ADMINISTRATIVO } from "../Routers/router";

export default function ListarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 10;
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
        <Button variant="primary" size="md" onClick={() => navigate(REGISTRO_USUARIO)}>
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
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No hay usuarios registrados</td>
              </tr>
            ) : (
              (() => {
                const indiceInicio = (paginaActual - 1) * usuariosPorPagina;
                const indiceFin = indiceInicio + usuariosPorPagina;
                const usuariosPagina = usuarios.slice(indiceInicio, indiceFin);
                
                return usuariosPagina.map(u => (
                  <tr key={u.id_usuario}>
                    <td>{u.id_usuario}</td>
                    <td>{u.usuario}</td>
                    <td>{u.nombre} {u.apellido}</td>
                    <td>{u.email}</td>
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
                ));
              })()
            )}
          </tbody>
        </Table>
      </div>

      {usuarios.length > usuariosPorPagina && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.First onClick={() => setPaginaActual(1)} disabled={paginaActual === 1} />
            <Pagination.Prev onClick={() => setPaginaActual(paginaActual - 1)} disabled={paginaActual === 1} />
            
            {[...Array(Math.ceil(usuarios.length / usuariosPorPagina))].map((_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === paginaActual}
                onClick={() => setPaginaActual(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
            
            <Pagination.Next 
              onClick={() => setPaginaActual(paginaActual + 1)} 
              disabled={paginaActual === Math.ceil(usuarios.length / usuariosPorPagina)} 
            />
            <Pagination.Last 
              onClick={() => setPaginaActual(Math.ceil(usuarios.length / usuariosPorPagina))} 
              disabled={paginaActual === Math.ceil(usuarios.length / usuariosPorPagina)} 
            />
          </Pagination>
        </div>
      )}

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
}
