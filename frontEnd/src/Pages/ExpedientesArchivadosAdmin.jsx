import Header_1 from "../Components/Header_1";
import Footer from "../Components/Footer";
import ExpedientesLista from "../Components/ExpedientesLista";

export default function ExpedientesArchivadosAdmin() {
  return (
    <div>
      <Header_1 />
      <div className="admin-hero">
        <div className="admin-wrap">
          <h1 className="admin-title">Expedientes Archivados</h1>
          <p className="admin-subtitle">Consulta los expedientes rechazados por el director</p>
          <div style={{ width: "100%", maxWidth: "100vw", margin: "0 auto", paddingTop: "10px" }}>
            <ExpedientesLista estado="rechazado" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
