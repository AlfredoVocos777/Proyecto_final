import React from "react";
import "../CSS/Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Sistema de Gestión de Expedientes Digitales</h4>
          <p>Dirección Provincial del Agua</p>
        </div>
        
        <div className="footer-section">
          <h4>Contacto</h4>
          <p>Email: consultas@dpa.gob.ar</p>
          <p>Teléfono: (0381) 4243837</p>
        </div>
        
        <div className="footer-section">
          <h4>Horario de Atención</h4>
          <p>Lunes a Viernes</p>
          <p>8:00 - 16:00 hs</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} Dirección Provincial del Agua - Todos los derechos reservados</p>
      </div>
    </footer>
  );
};

export default Footer;
