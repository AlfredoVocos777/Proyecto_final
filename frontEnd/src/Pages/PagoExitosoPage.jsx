import React from "react";
import Header_1 from "../Components/Header_1";
import Footer from "../Components/Footer";
import PagoExitoso from "../Components/pagoexitoso";
import "../CSS/PageLayout.css";

const PagoExitosoPage = () => {
  return (
    <div>
      <Header_1 />
      <main className="page-content">
        <PagoExitoso />
      </main>
      <Footer />
    </div>
  );
};

export default PagoExitosoPage;
