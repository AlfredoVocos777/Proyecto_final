import { useState, useEffect } from "react";
import { Table, Button, Modal, Alert, Spinner, Pagination, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL_FIRMAS } from "../Constants/endpoints";
import { CREAR_FIRMA, PORTADA_ADMINISTRATIVO } from "../Routers/router";

const ListarFirmas = () => {
  const [firmas, setFirmas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [firmaAEliminar, setFirmaAEliminar] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const firmasPorPagina = 10;
  const navigate = useNavigate();

  const cargarFirmas = async () => {
    try {
      setCargando(true);
      const response = await axios.get(URL_FIRMAS);
      setFirmas(response.data);
      setError("");
    } catch (err) {
      console.error("Error al cargar firmas:", err);
      setError("Error al cargar las firmas digitales");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarFirmas();
  }, []);

  const confirmarEliminacion = (firma) => {
    setFirmaAEliminar(firma);
    setMostrarModal(true);
  };

  const eliminarFirma = async () => {
    if (!firmaAEliminar) return;

    try {
      await axios.delete(`${URL_FIRMAS}/${firmaAEliminar.id_firma}`);
      setMostrarModal(false);
      setFirmaAEliminar(null);
      cargarFirmas();
    } catch (err) {
      console.error("Error al eliminar firma:", err);
      setError("Error al eliminar la firma digital");
      setMostrarModal(false);
    }
  };

  const cancelarEliminacion = () => {
    setMostrarModal(false);
    setFirmaAEliminar(null);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleString("es-AR");
  };

  if (cargando) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando firmas digitales...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Firmas Digitales</h2>
        <Button variant="primary" size="md" onClick={() => navigate(CREAR_FIRMA)}>
          + Crear Nueva Firma
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Expediente</th>
            <th>Usuario</th>
            <th>Método</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {firmas.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                No hay firmas digitales registradas
              </td>
            </tr>
          ) : (
            (() => {
              const indiceInicio = (paginaActual - 1) * firmasPorPagina;
              const indiceFin = indiceInicio + firmasPorPagina;
              const firmasPagina = firmas.slice(indiceInicio, indiceFin);
              
              return firmasPagina.map((firma) => (
                <tr key={firma.id_firma}>
                  <td>{firma.id_firma}</td>
                  <td>
                    <div>
                      <Badge bg="secondary">{firma.numero_expediente}</Badge>
                      <br />
                      <small className="text-muted">{firma.asunto}</small>
                    </div>
                  </td>
                  <td>{firma.nombre_usuario || "-"}</td>
                  <td>{firma.metodo_firma || "-"}</td>
                  <td>{formatearFecha(firma.fecha_firma)}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => confirmarEliminacion(firma)}
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

      {firmas.length > firmasPorPagina && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.First onClick={() => setPaginaActual(1)} disabled={paginaActual === 1} />
            <Pagination.Prev onClick={() => setPaginaActual(paginaActual - 1)} disabled={paginaActual === 1} />
            
            {[...Array(Math.ceil(firmas.length / firmasPorPagina))].map((_, index) => (
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
              disabled={paginaActual === Math.ceil(firmas.length / firmasPorPagina)} 
            />
            <Pagination.Last 
              onClick={() => setPaginaActual(Math.ceil(firmas.length / firmasPorPagina))} 
              disabled={paginaActual === Math.ceil(firmas.length / firmasPorPagina)} 
            />
          </Pagination>
        </div>
      )}

      <Modal show={mostrarModal} onHide={cancelarEliminacion}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Está seguro que desea eliminar esta firma digital?
          <br />
          <strong>Expediente:</strong> {firmaAEliminar?.numero_expediente}
          <br />
          <strong>Usuario:</strong> {firmaAEliminar?.nombre_usuario}
          <br />
          <small className="text-muted mt-2 d-block">Esta acción no se puede deshacer.</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelarEliminacion}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={eliminarFirma}>
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

export default ListarFirmas;
