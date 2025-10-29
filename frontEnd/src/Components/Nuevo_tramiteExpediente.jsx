import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button } from "react-bootstrap";

import "../CSS/Nuevo_tramitePago.css";
import lineaTiempo3 from "../assets/linea de tiempo 3.png";
import mercadopagoIcono from "../assets/mercadopago.png";
import tarjetaIcono from "../assets/tarjeta.png";
import pagofacilIcono from "../assets/pagofacil.png";

const NuevoTramiteDatos = () => {
  const navigate = useNavigate();

  const initialUsuario = {
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    direccion: "",
    telefono: "",
    usuario: "",
    contraseña: "",
  };

    const initialTramite = {
    tipo_tramite: "",
    denominacion: "",
    ubicacion: "",
    descripcion: "",
  };


  const [usuario, setUsuario] = useState(initialUsuario);
  const [tramite, setTramite] = useState(initialTramite);


  {
    //---------------------------------------------------------
  }

  

  // Cargar datos del usuario logueado desde el localStorage para mostrar en el formulario
  useEffect(() => {
  const usuarioGuardado = localStorage.getItem("usuarioLogueado");
  if (usuarioGuardado) {
    const datosUsuario = JSON.parse(usuarioGuardado);
    setUsuario(datosUsuario);
  }
}, []);

  // Cargar datos del tramite desde el localStorage para mostrar en el formulario
useEffect(() => {
  const tramiteGuardado = localStorage.getItem("tipoTramite");
  if (tramiteGuardado) {
    const datosTramite = JSON.parse(tramiteGuardado);
    setTramite(datosTramite);
  }
}, []);


// manejo del click hacia las opciones de pago

const handlePago = (metodo) => {
  switch (metodo) {
    case "tarjeta":
      // redirigir a Mercado Pago
     window.open("https://www.mercadopago.com.ar", "_blank");
      break;

    case "transferencia":
      // Podés llevar a otra ruta interna o externa
      window.open("https://pagatodo.com.do/web", "_blank");
      break;

    case "efectivo":
      // Otra acción o vista
      window.open("https://www.pagofacil.com.ar", "_blank");
      break;

    default:
      alert("Método de pago no reconocido");
  }
};


// ---------------------------------------------------------------------
  return (
    <div className="portadaDatos">

      <div className="claseTitulosDatos">

        <h1 className="tituloDatos">TRÁMITE FINALIZADO</h1>
        

      </div>


      <div className="subportadaDatos">

        <div className="lineaTiempoContainerDatos">
          <img src={lineaTiempo3} alt="linea de tiempoDatos" />
        </div>

        <div className="conteinerDatoss">

          


          {/* Formulario Datos*/}
          <div className="contenedorFormPago">
            <h2 className="tituloDatos2">RSU NUMERO DE TRÁMITE</h2>

            <div className="contenedorFormPago2">
                <div className="filaPago">
                    <label className="labelPago">Número de Trámite</label>
                    <span className="valorPago"> </span>
                </div>

                <div className="filaPago">
                    <label className="labelPago">Fecha de creación</label>
                    <span className="valorPago">  </span>
                </div>

                <div className="filaPago">
                    <label className="labelPago">Proyecto</label>
                    <span className="valorPago">{tramite.tipo_tramite}</span>
                </div>

                <div className="filaPago">
                    <label className="labelPagoTatal" >Nombre y Apellido</label>
                    <span className="valorPago">{usuario.nombre} {usuario.apellido}</span>
                </div> 


                </div>

          </div>





        

          <div className="contenedorBotonDatos">
            
            <Button className='btnAtras'
              variant="primary" 
              type="button" 
              onClick={() => navigate("/Nuevo_tramite")}
            >           
              Atras
            </Button>

            <Button
              size="sm"
              className="btn-continuar"
              variant="secondary"
              type="button"
              onClick={() =>  navigate("/Nuevo_tramiteExpediente")}
            >
              Continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevoTramiteDatos;
