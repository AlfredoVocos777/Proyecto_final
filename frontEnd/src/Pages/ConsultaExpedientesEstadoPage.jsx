import Header_1 from "../Components/Header_1";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";

export default function ConsultaExpedientesEstadoPage() {
  const navigate = useNavigate();
  return (
    <div>
      <Header_1 />
      <div className="admin-hero">
        <div className="admin-wrap">
          <h1 className="admin-title">Dirección Provincial del Agua</h1>
          <p className="admin-subtitle">SIGEDEX · Consulta de expedientes</p>
          <div className="admin-card">
            <div className="admin-actions">
              <button className="admin-btn primary" onClick={() => navigate('/ExpedientesEnRevision')}>En revisión</button>
              <button className="admin-btn success" onClick={() => navigate('/ExpedientesFinalizados')}>Finalizados</button>
              <button className="admin-btn warning" onClick={() => navigate('/ExpedientesArchivados')}>Archivados</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
