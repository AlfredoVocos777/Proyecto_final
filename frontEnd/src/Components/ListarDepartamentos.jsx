import { useState, useEffect } from "react";
import { Table, Button, Modal, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL_DEPARTAMENTOS } from "../Constants/endpoints";
import { CREAR_DEPARTAMENTO } from "../Routers/router";

const ListarDepartamentos = () => {
  const [departamentos, setDepartamentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [departamentoAEliminar, setDepartamentoAEliminar] = useState(null);
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
        <Button variant="primary" onClick={() => navigate(CREAR_DEPARTAMENTO)}>
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
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {departamentos.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">
                No hay departamentos registrados
              </td>
            </tr>
          ) : (
            departamentos.map((dept) => (
              <tr key={dept.id_departamento}>
                <td>{dept.id_departamento}</td>
                <td>{dept.nombre}</td>
                <td>{dept.descripcion || "-"}</td>
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
            ))
          )}
        </tbody>
      </Table>

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
    </div>
  );
};

export default ListarDepartamentos;
