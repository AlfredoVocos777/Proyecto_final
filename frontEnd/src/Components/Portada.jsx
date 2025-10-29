import { Container, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../CSS/Portada.css";


const Portada = () => {
  const navigate = useNavigate();

  return (
    <div className="portadaGeneral">
      <div className="fondoTitulo">
       
      </div>

      <div className="portada">
        <div>
          <h1 className="titulo">Sistema de Gestion de Expedientes</h1>
          <h2 className="subtitulo">Dirección Provincial del Agua</h2>
        </div>
        <div className="subportada">
          <div className="contenedorBoton">
            <Button className="btns"
              variant="primary"
              type="submit"
              onClick={() => navigate("/Nuevo_tramiteDatos")}
            >
              Nuevo Trámite
            </Button>

            <Button className="btns2"
              variant="secondary"
              type="button"
              onClick={() => navigate("/Consulta")}
            >
              Consulta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portada;
