import { useState, useEffect } from "react";
import { Table, Button, Modal, Alert, Spinner, Form, Pagination } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL_PERMISOS, URL_ROLES } from "../Constants/endpoints";
import { CREAR_PERMISO, PORTADA_ADMINISTRATIVO } from "../Routers/router";

const ListarPermisos = () => {
  const [permisos, setPermisos] = useState([]);
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [permisoAEliminar, setPermisoAEliminar] = useState(null);
  const [mostrarAsignar, setMostrarAsignar] = useState(false);
  const [permisoAAsignar, setPermisoAAsignar] = useState(null);
  const [rolSeleccionado, setRolSeleccionado] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const permisosPorPagina = 10;
  const navigate = useNavigate();

  const cargarPermisos = async () => {
    try {
      setCargando(true);
      const [permisosRes, rolesRes] = await Promise.all([
        axios.get(URL_PERMISOS),
        axios.get(URL_ROLES)
      ]);
      setPermisos(permisosRes.data);
      setRoles(rolesRes.data);
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

  const abrirAsignar = (permiso) => {
    setPermisoAAsignar(permiso);
    setRolSeleccionado("");
    setMostrarAsignar(true);
    setError("");
    setExito("");
  };

  const cerrarAsignar = () => {
    setMostrarAsignar(false);
    setPermisoAAsignar(null);
    setRolSeleccionado("");
  };

  const asignarPermisoARol = async () => {
    if (!rolSeleccionado || !permisoAAsignar) {
      setError("Seleccione un rol");
      return;
    }

    try {
      // Obtener el rol actual con sus permisos
      const rolRes = await axios.get(`${URL_ROLES}/${rolSeleccionado}`);
      const rolActual = rolRes.data;
      const permisosActuales = rolActual.permisos?.map(p => p.id_permiso) || [];
      
      // Verificar si ya tiene el permiso
      if (permisosActuales.includes(permisoAAsignar.id_permiso)) {
        setError("Este rol ya tiene asignado este permiso");
        return;
      }
      
      // Agregar el nuevo permiso
      const nuevosPermisos = [...permisosActuales, permisoAAsignar.id_permiso];
      
      // Actualizar el rol con los permisos
      await axios.put(`${URL_ROLES}/${rolSeleccionado}`, {
        nombre: rolActual.nombre,
        descripcion: rolActual.descripcion,
        permisos: nuevosPermisos
      });
      
      setExito(`Permiso "${permisoAAsignar.nombre}" asignado al rol exitosamente`);
      setTimeout(() => {
        cerrarAsignar();
        setExito("");
      }, 2000);
    } catch (err) {
      console.error("Error al asignar permiso:", err);
      setError("Error al asignar el permiso al rol");
    }
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
      {exito && <Alert variant="success">{exito}</Alert>}

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
            (() => {
              const indiceInicio = (paginaActual - 1) * permisosPorPagina;
              const indiceFin = indiceInicio + permisosPorPagina;
              const permisosPagina = permisos.slice(indiceInicio, indiceFin);
              
              return permisosPagina.map((permiso) => (
                <tr key={permiso.id_permiso}>
                  <td>{permiso.id_permiso}</td>
                  <td>{permiso.nombre}</td>
                  <td>{permiso.descripcion || "-"}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => abrirAsignar(permiso)}
                      >
                        Asignar a Rol
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => confirmarEliminacion(permiso)}
                      >
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

      {/* Paginación */}
      {permisos.length > permisosPorPagina && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.First onClick={() => setPaginaActual(1)} disabled={paginaActual === 1} />
            <Pagination.Prev onClick={() => setPaginaActual(paginaActual - 1)} disabled={paginaActual === 1} />
            
            {[...Array(Math.ceil(permisos.length / permisosPorPagina))].map((_, index) => (
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
              disabled={paginaActual === Math.ceil(permisos.length / permisosPorPagina)} 
            />
            <Pagination.Last 
              onClick={() => setPaginaActual(Math.ceil(permisos.length / permisosPorPagina))} 
              disabled={paginaActual === Math.ceil(permisos.length / permisosPorPagina)} 
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

      {/* Modal de asignar permiso a rol */}
      <Modal show={mostrarAsignar} onHide={cerrarAsignar}>
        <Modal.Header closeButton>
          <Modal.Title>Asignar Permiso a Rol</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Permiso: <strong>{permisoAAsignar?.nombre}</strong></p>
          <Form.Group className="mb-3">
            <Form.Label>Seleccionar Rol</Form.Label>
            <Form.Select 
              value={rolSeleccionado} 
              onChange={(e) => setRolSeleccionado(e.target.value)}
            >
              <option value="">Seleccione un rol...</option>
              {roles.map(r => (
                <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarAsignar}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={asignarPermisoARol}>
            Asignar
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
