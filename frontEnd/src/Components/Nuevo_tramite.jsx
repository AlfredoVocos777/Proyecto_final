
import { Container, Form, Button } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import "../CSS/NuevoTramite.css";
import lineaTiempo2 from "../assets/linea de tiempo 2.png";

const NuevoTramite = () => {
    const navigate = useNavigate();

  

  return (
    
    <div className="portada2">
        <div className='claseTitulos2'>
            <h1 className="titulo2">Nuevo Trámite</h1>
            <h2 className="subtitulo2">Complete la documentación requerida para iniciar su expediente</h2>
        </div>
        <div className="subportada2">
            <div className="lineaTiempoContainer">
            
            <img src={lineaTiempo2} alt="linea de tiempo" />
            
            
            </div>

            <div className="conteinerDocumentacion">
                <h2 className="tituloDocumentacion">Documentación Requerida:</h2>
                <h3 className="subtituloDocumentacion">Complete los documentos necesarios para su trámite:</h3>

                <div className="cargaArchivos">

                </div>

                <div>
                    <h2 className="tituloLista">Documentos Requeridos:</h2>
                    <ul className="listaDocumentacion">
                        <li>DNI del presentante</li>
                        <li>Plano de ubicación de proyecto</li>
                        <li>Memoria descriptiva</li>
                        <li>Titulo de propiedad o boleto de compra venta</li>
                    </ul>
                </div>

                <div className="contenedorBoton">
                    <Button className='btn'
                    variant="primary" 
                    type="submit" 
                    onClick={() => navigate("/Nuevo_tramiteDatos")}
                    >           
                    Atras
                    </Button>
                                
                    <Button 
                        variant="secondary"
                        type="button"
                        onClick={() => navigate("/Nuevo_tramitePago")}
                        >
                        Continuar al pago 
                    </Button>
                </div>

            </div>
        </div>
    </div>
  );
};

export default NuevoTramite;