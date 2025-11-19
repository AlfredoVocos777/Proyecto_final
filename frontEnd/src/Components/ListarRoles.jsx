import { useState, useEffect } from "react";
import { Table, Button, Modal, Alert, Spinner, Pagination } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL_ROLES } from "../Constants/endpoints";
import { CREAR_ROL, PORTADA_ADMINISTRATIVO } from "../Routers/router";

const ListarRoles = () => {
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [rolAEliminar, setRolAEliminar] = useState(null);
  const [mostrarPermisos, setMostrarPermisos] = useState(false);
  const [rolPermisos, setRolPermisos] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const rolesPorPagina = 10;
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

  const verPermisos = (rol) => {
    setRolPermisos(rol);
    setMostrarPermisos(true);
  };

  const cerrarPermisos = () => {
    setMostrarPermisos(false);
    setRolPermisos(null);
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
        <Button variant="primary" size="md" onClick={() => navigate(CREAR_ROL)}>
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
            <th>Permisos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {roles.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                No hay roles registrados
              </td>
            </tr>
          ) : (
            (() => {
              const indiceInicio = (paginaActual - 1) * rolesPorPagina;
              const indiceFin = indiceInicio + rolesPorPagina;
              const rolesPagina = roles.slice(indiceInicio, indiceFin);
              
              return rolesPagina.map((rol) => (
                <tr key={rol.id_rol}>
                  <td>{rol.id_rol}</td>
                  <td>{rol.nombre}</td>
                  <td>{rol.descripcion || "-"}</td>
                  <td className="text-center">
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => verPermisos(rol)}
                    >
                      Ver ({rol.permisos?.length || 0})
                    </Button>
                  </td>
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
              ));
            })()
          )}
        </tbody>
      </Table>
      </div>

      {roles.length > rolesPorPagina && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.First onClick={() => setPaginaActual(1)} disabled={paginaActual === 1} />
            <Pagination.Prev onClick={() => setPaginaActual(paginaActual - 1)} disabled={paginaActual === 1} />
            
            {[...Array(Math.ceil(roles.length / rolesPorPagina))].map((_, index) => (
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
              disabled={paginaActual === Math.ceil(roles.length / rolesPorPagina)} 
            />
            <Pagination.Last 
              onClick={() => setPaginaActual(Math.ceil(roles.length / rolesPorPagina))} 
              disabled={paginaActual === Math.ceil(roles.length / rolesPorPagina)} 
            />
          </Pagination>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
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

      {/* Modal de permisos */}
      <Modal show={mostrarPermisos} onHide={cerrarPermisos} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Permisos del Rol: {rolPermisos?.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {rolPermisos?.permisos && rolPermisos.permisos.length > 0 ? (
            <Table striped bordered size="sm">
              <thead>
                <tr>
                  <th>Permiso</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {rolPermisos.permisos.map((p) => (
                  <tr key={p.id_permiso}>
                    <td><strong>{p.nombre}</strong></td>
                    <td>{p.descripcion || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted text-center">Este rol no tiene permisos asignados.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarPermisos}>
            Cerrar
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

export default ListarRoles;
