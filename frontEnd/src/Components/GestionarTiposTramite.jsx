import { useState, useEffect } from "react";
import { Table, Button, Modal, Alert, Spinner, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL_TIPOS_TRAMITE } from "../Constants/endpoints";
import { PORTADA_ADMINISTRATIVO } from "../Routers/router";
import "../CSS/DocumentacionAdjunta.css";

const GestionarTiposTramite = () => {
  const navigate = useNavigate();

  const [tipos, setTipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  // Modal agregar/editar
  const [mostrarFormModal, setMostrarFormModal] = useState(false);
  const [tipoEditando, setTipoEditando] = useState(null); // null = crear, objeto = editar
  const [formNombre, setFormNombre] = useState("");
  const [formImporte, setFormImporte] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState("");

  // Modal confirmar eliminación
  const [mostrarConfirmModal, setMostrarConfirmModal] = useState(false);
  const [tipoAEliminar, setTipoAEliminar] = useState(null);

  const cargarTipos = async () => {
    try {
      setCargando(true);
      const { data } = await axios.get(URL_TIPOS_TRAMITE);
      setTipos(data);
      setError("");
    } catch (e) {
      console.error(e);
      setError("Error al cargar los tipos de trámite");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTipos();
  }, []);

  // ── Abrir modal para crear ──────────────────────────
  const abrirCrear = () => {
    setTipoEditando(null);
    setFormNombre("");
    setFormImporte("");
    setErrorForm("");
    setMostrarFormModal(true);
  };

  // ── Abrir modal para editar ─────────────────────────
  const abrirEditar = (tipo) => {
    setTipoEditando(tipo);
    setFormNombre(tipo.nombre);
    setFormImporte(String(tipo.importe));
    setErrorForm("");
    setMostrarFormModal(true);
  };

  // ── Guardar (crear o editar) ─────────────────────────
  const handleGuardar = async (e) => {
    e.preventDefault();
    setErrorForm("");

    const nombre = formNombre.trim();
    const importe = parseFloat(formImporte);

    if (!nombre) {
      setErrorForm("El nombre no puede estar vacío.");
      return;
    }
    if (isNaN(importe) || importe < 0) {
      setErrorForm("El importe debe ser un número mayor o igual a 0.");
      return;
    }

    try {
      setGuardando(true);
      if (tipoEditando) {
        await axios.put(`${URL_TIPOS_TRAMITE}/${tipoEditando.id_tipo}`, { nombre, importe });
        setExito("Tipo de trámite actualizado correctamente.");
      } else {
        await axios.post(URL_TIPOS_TRAMITE, { nombre, importe });
        setExito("Tipo de trámite creado correctamente.");
      }
      setMostrarFormModal(false);
      cargarTipos();
    } catch (e) {
      const msg = e.response?.data?.error || "Error al guardar. Intente de nuevo.";
      setErrorForm(msg);
    } finally {
      setGuardando(false);
    }
  };

  // ── Confirmar eliminación ───────────────────────────
  const confirmarEliminar = (tipo) => {
    setTipoAEliminar(tipo);
    setMostrarConfirmModal(true);
  };

  const handleEliminar = async () => {
    if (!tipoAEliminar) return;
    try {
      await axios.delete(`${URL_TIPOS_TRAMITE}/${tipoAEliminar.id_tipo}`);
      setMostrarConfirmModal(false);
      setTipoAEliminar(null);
      setExito("Tipo de trámite eliminado.");
      cargarTipos();
    } catch (e) {
      setError("No se pudo eliminar. Puede estar en uso por expedientes existentes.");
      setMostrarConfirmModal(false);
    }
  };

  // ── Render ───────────────────────────────────────────
  return (
    <div className="container mt-5 pt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Gestión de Tipos de Trámite</h2>
          <small className="text-muted">Administrá los tipos de trámite y sus importes</small>
        </div>
        <div className="d-flex gap-3 align-items-center">
          <Button 
            variant="primary" 
            onClick={abrirCrear} 
            className="btn-gestion-header shadow-sm"
          >
            <i className="bi bi-plus-circle"></i>Agregar Tipo
          </Button>
          <Button 
            variant="outline-secondary" 
            className="btn-gestion-header btn-volver-sm shadow-sm"
            onClick={() => navigate(PORTADA_ADMINISTRATIVO)}
          >
            ← Volver
          </Button>
        </div>
      </div>

      {exito && (
        <Alert variant="success" dismissible onClose={() => setExito("")}>
          {exito}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {cargando ? (
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Cargando...</p>
        </div>
      ) : (
        <div className="modern-table-container">
          <Table hover responsive className="modern-table">
            <thead>
              <tr>
                <th className="text-center" style={{ width: '80px' }}>#</th>
                <th>Nombre del Trámite</th>
                <th className="text-center">Importe ($)</th>
                <th className="text-center" style={{ width: '200px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tipos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-5">
                    <i className="bi bi-info-circle me-2"></i>
                    No hay tipos de trámite registrados.
                  </td>
                </tr>
              ) : (
                tipos.map((t, idx) => (
                  <tr key={t.id_tipo}>
                    <td className="text-center text-muted fw-bold">{idx + 1}</td>
                    <td>{t.nombre}</td>
                    <td className="text-center">
                      <span className="fw-bold text-dark">${Number(t.importe).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <Button
                          variant="warning"
                          size="sm"
                          className="px-3"
                          onClick={() => abrirEditar(t)}
                        >
                          <i className="bi bi-pencil me-1"></i>Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="px-3"
                          onClick={() => confirmarEliminar(t)}
                        >
                          <i className="bi bi-trash me-1"></i>Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}

      {/* ── Modal Agregar / Editar ────────────────────── */}
      <Modal show={mostrarFormModal} onHide={() => setMostrarFormModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {tipoEditando ? "Editar Tipo de Trámite" : "Agregar Tipo de Trámite"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleGuardar}>
          <Modal.Body>
            {errorForm && <Alert variant="danger">{errorForm}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>
                Nombre <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: Constancia de prefactibilidad de no inundabilidad"
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                required
                maxLength={150}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Importe ($) <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                placeholder="0.00"
                value={formImporte}
                onChange={(e) => setFormImporte(e.target.value)}
                required
                min="0"
                step="0.01"
              />
              <Form.Text className="text-muted">
                Monto que abonará el presentante al iniciar este trámite.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setMostrarFormModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : tipoEditando ? "Guardar Cambios" : "Crear Tipo"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ── Modal Confirmar Eliminación ───────────────── */}
      <Modal show={mostrarConfirmModal} onHide={() => setMostrarConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {tipoAEliminar && (
            <p>
              ¿Estás seguro de que querés eliminar el tipo{" "}
              <strong>"{tipoAEliminar.nombre}"</strong>?
              <br />
              <span className="text-danger">Esta acción no se puede deshacer.</span>
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarConfirmModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleEliminar}>
            Sí, eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GestionarTiposTramite;
