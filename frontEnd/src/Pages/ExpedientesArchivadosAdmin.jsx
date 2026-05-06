import { useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Header_1 from "../Components/Header_1";
import Footer from "../Components/Footer";
import ExpedientesLista from "../Components/ExpedientesLista";
import BotonesReporte from "../Components/BotonesReporte";

export default function ExpedientesArchivadosAdmin() {
  const navigate = useNavigate();
  const [generandoPDF, setGenerandoPDF] = useState(false);

  const exportarPDF = async () => {
    setGenerandoPDF(true);
    try {
      const res = await fetch("http://localhost:8000/expedientes?estado=rechazado");
      const data = await res.json();
      const doc = new jsPDF();
      const fecha = new Date().toLocaleString();
      doc.text("Reporte de Expedientes Archivados", 14, 15);
      doc.setFontSize(10);
      doc.text(`Fecha: ${fecha}`, 14, 22);
      autoTable(doc, {
        startY: 28,
        columns: [
          { header: "N° Expediente", dataKey: "numero_expediente" },
          { header: "Tipo", dataKey: "tipo_expediente" },
          { header: "Descripción", dataKey: "descripcion" },
          { header: "Presentante", dataKey: "presentante" },
          { header: "Fecha", dataKey: "fecha" },
          { header: "Estado", dataKey: "estado_actual" },
        ],
        body: data.map(e => ({
          numero_expediente: e.numero_expediente,
          tipo_expediente: e.tipo_expediente,
          descripcion: e.descripcion,
          presentante: e.presentante || e.usuario_nombre || "",
          fecha: e.fecha_creacion ? new Date(e.fecha_creacion).toLocaleDateString() : "",
          estado_actual: e.estado_actual,
        })),
      });
      return doc.output("bloburl");
    } catch (err) {
      alert(`No se pudo generar el reporte: ${err?.message ?? err}`);
      return null;
    } finally {
      setGenerandoPDF(false);
    }
  };

  return (
    <div>
      <Header_1 />
      <div className="admin-hero">
        <div className="admin-wrap">
          <h1 className="admin-title">Expedientes Archivados</h1>
          <p className="admin-subtitle">Consulta los expedientes rechazados por el director</p>
          <BotonesReporte
            onVolver={() => navigate("/consulta-expedientes-estado")}
            onGenerarPDF={exportarPDF}
            generando={generandoPDF}
            nombreArchivo="reporte_expedientes_archivados.pdf"
          />
          <div style={{ width: "100%", maxWidth: "100vw", margin: "0 auto", paddingTop: "10px" }}>
            <ExpedientesLista estado="rechazado" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
