import Header_1 from "../Components/Header_1";
import Footer from "../Components/Footer";
import ExpedientesLista from "../Components/ExpedientesLista";

export default function ExpedientesEnRevisionPage() {
  return (
    <div>
      <Header_1 />
      <div className="admin-hero">
        <div className="admin-wrap">
          <h1 className="admin-title">Expedientes en revisión</h1>
          <p className="admin-subtitle">Filtra y consulta los expedientes que están en revisión</p>
            <div style={{ width: "100%", maxWidth: "100vw", margin: "0 auto", paddingTop: "10px" }}>
            <ExpedientesLista estado="en revisión" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
