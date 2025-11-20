import { useState, useEffect } from "react";
import { Table, Button, Modal, Alert, Spinner, Pagination } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL_DEPARTAMENTOS } from "../Constants/endpoints";
import { CREAR_DEPARTAMENTO, PORTADA_ADMINISTRATIVO } from "../Routers/router";

const ListarDepartamentos = () => {
  const [departamentos, setDepartamentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [departamentoAEliminar, setDepartamentoAEliminar] = useState(null);
  const [mostrarUsuarios, setMostrarUsuarios] = useState(false);
  const [departamentoUsuarios, setDepartamentoUsuarios] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const departamentosPorPagina = 10;
  const navigate = useNavigate();

  const cargarDepartamentos = async () => {
    try {
      setCargando(true);
      const response = await axios.get(URL_DEPARTAMENTOS);
      setDepartamentos(response.data);
      setError("");
    } catch (err) {
      console.error("Error al cargar departamentos:", err);
      setError("Error al cargar los departamentos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDepartamentos();
  }, []);

  const confirmarEliminacion = (departamento) => {
    setDepartamentoAEliminar(departamento);
    setMostrarModal(true);
  };

  const eliminarDepartamento = async () => {
    if (!departamentoAEliminar) return;

    try {
      await axios.delete(`${URL_DEPARTAMENTOS}/${departamentoAEliminar.id_departamento}`);
      setMostrarModal(false);
      setDepartamentoAEliminar(null);
      cargarDepartamentos();
    } catch (err) {
      console.error("Error al eliminar departamento:", err);
      setError("Error al eliminar el departamento. Puede que tenga expedientes asociados.");
      setMostrarModal(false);
    }
  };

  const cancelarEliminacion = () => {
    setMostrarModal(false);
    setDepartamentoAEliminar(null);
  };

  const verUsuarios = (dept) => {
    setDepartamentoUsuarios(dept);
    setMostrarUsuarios(true);
  };

  const cerrarUsuarios = () => {
    setMostrarUsuarios(false);
    setDepartamentoUsuarios(null);
  };

  if (cargando) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando departamentos...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Departamentos</h2>
        <Button variant="primary" size="md" onClick={() => navigate(CREAR_DEPARTAMENTO)}>
          + Crear Nuevo Departamento
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Usuarios</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {departamentos.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                No hay departamentos registrados
              </td>
            </tr>
          ) : (
            (() => {
              const indiceInicio = (paginaActual - 1) * departamentosPorPagina;
              const indiceFin = indiceInicio + departamentosPorPagina;
              const departamentosPagina = departamentos.slice(indiceInicio, indiceFin);
              
              return departamentosPagina.map((dept) => (
                <tr key={dept.id_departamento}>
                  <td>{dept.id_departamento}</td>
                  <td>{dept.nombre}</td>
                  <td>{dept.descripcion || "-"}</td>
                  <td className="text-center">
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => verUsuarios(dept)}
                    >
                      Ver ({dept.usuarios?.length || 0})
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => confirmarEliminacion(dept)}
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

      {departamentos.length > departamentosPorPagina && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.First onClick={() => setPaginaActual(1)} disabled={paginaActual === 1} />
            <Pagination.Prev onClick={() => setPaginaActual(paginaActual - 1)} disabled={paginaActual === 1} />
            
            {[...Array(Math.ceil(departamentos.length / departamentosPorPagina))].map((_, index) => (
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
              disabled={paginaActual === Math.ceil(departamentos.length / departamentosPorPagina)} 
            />
            <Pagination.Last 
              onClick={() => setPaginaActual(Math.ceil(departamentos.length / departamentosPorPagina))} 
              disabled={paginaActual === Math.ceil(departamentos.length / departamentosPorPagina)} 
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
          ¿Está seguro que desea eliminar el departamento <strong>{departamentoAEliminar?.nombre}</strong>?
          <br />
          <small className="text-muted">Esta acción no se puede deshacer.</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelarEliminacion}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={eliminarDepartamento}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de usuarios del departamento */}
      <Modal show={mostrarUsuarios} onHide={cerrarUsuarios} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Usuarios del Departamento: {departamentoUsuarios?.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {departamentoUsuarios?.usuarios && departamentoUsuarios.usuarios.length > 0 ? (
            <Table striped bordered size="sm">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Nombre Completo</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {departamentoUsuarios.usuarios.map((u) => (
                  <tr key={u.id_usuario}>
                    <td><strong>{u.usuario}</strong></td>
                    <td>{u.nombre} {u.apellido}</td>
                    <td>{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted text-center">Este departamento no tiene usuarios asignados.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarUsuarios}>
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

export default ListarDepartamentos;
