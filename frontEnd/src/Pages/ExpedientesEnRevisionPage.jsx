import { useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import Header_1 from "../Components/Header_1";
import Footer from "../Components/Footer";
import ExpedientesLista from "../Components/ExpedientesLista";
import BotonesReporte from "../Components/BotonesReporte";

export default function ExpedientesEnRevisionPage() {
  const navigate = useNavigate();
  const [generando, setGenerando] = useState(false);

  const exportarPDF = async () => {
    setGenerando(true);
    try {
      const res = await axios.get("http://localhost:8000/expedientes", {
        params: { estado: "en revisión" },
      });
      const expedientes = Array.isArray(res.data) ? res.data : [];

      const doc = new jsPDF();
      const fecha = new Date().toLocaleString("es-AR");
      doc.setFontSize(14);
      doc.text("Reporte de Expedientes en Revisión", 14, 15);
      doc.setFontSize(10);
      doc.text(`Fecha: ${fecha}`, 14, 22);

      const columns = [
        { header: "N° Expediente", dataKey: "numero_expediente" },
        { header: "Tipo", dataKey: "tipo_expediente" },
        { header: "Descripción", dataKey: "descripcion" },
        { header: "Presentante", dataKey: "presentante" },
        { header: "Fecha", dataKey: "fecha" },
        { header: "Estado", dataKey: "estado_actual" },
      ];

      const rows = expedientes.map((e) => ({
        numero_expediente: e.numero_expediente ?? "",
        tipo_expediente: e.tipo_expediente ?? "",
        descripcion: e.descripcion ?? "",
        presentante:
          e.usuario_presentante_nombre
            ? `${e.usuario_presentante_nombre} ${e.usuario_presentante_apellido ?? ""}`.trim()
            : e.presentante ?? e.usuario_nombre ?? "",
        fecha: e.fecha_creacion
          ? new Date(e.fecha_creacion).toLocaleDateString("es-AR")
          : "",
        estado_actual: e.estado_actual ?? "",
      }));

      autoTable(doc, { columns, body: rows, startY: 28 });
      return doc.output('bloburl');
    } catch (err) {
      console.error("Error al generar reporte:", err);
      alert(`No se pudo generar el reporte: ${err?.message ?? err}`);
      return null;
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div>
      <Header_1 />
      <div className="admin-hero">
        <div className="admin-wrap">
          <h1 className="admin-title">Expedientes en revisión</h1>
          <p className="admin-subtitle">Filtra y consulta los expedientes que están en revisión</p>
          <BotonesReporte
            onVolver={() => navigate("/consulta-expedientes-estado")}
            onGenerarPDF={exportarPDF}
            nombreArchivo="reporte_expedientes_en_revision.pdf"
            generando={generando}
          />
          <div style={{ width: "100%", maxWidth: "100vw", margin: "0 auto", paddingTop: "10px" }}>
            <ExpedientesLista estado="en revisión" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
