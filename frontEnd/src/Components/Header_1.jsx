import React from "react";
import { Link } from "react-router-dom";
import "../CSS/Header.css";

import logoDpa from "../assets/logo_dpa.png";
import logoMinisterio from "../assets/logo_ministerio.png";

const Header_1 = () => {
  return (
    <header className="navbar">
      {/* Logo DPA a la izquierda con link */}
      <div className="logoDpa">
        <Link to="/">
          <img src={logoDpa} alt="logo_dpa" />
        </Link>
      </div>

      {/* Logo Ministerio arriba a la derecha */}
      <div className="logoMinisterio">
        <img src={logoMinisterio} alt="logo_ministerio" />
      </div>
    </header>
  );
};

export default Header_1;
