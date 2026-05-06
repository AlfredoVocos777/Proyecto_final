import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import Header_1 from "./Header_1";
import Footer from "./Footer";
import "../CSS/common.css";
import "../CSS/UsuarioJuridico.css";
import BotonesReporte from "./BotonesReporte";


const ExpedientesFinalizados = () => {
  const navigate = useNavigate();
  const [generandoPDF, setGenerandoPDF] = useState(false);
    // Función para exportar la tabla a PDF
    const exportarPDF = () => {
      setGenerandoPDF(true);
      try {
      const doc = new jsPDF();
      const fecha = new Date().toLocaleString();
      doc.text("Reporte de Expedientes Finalizados", 14, 15);
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
      const rows = expedientes.map(e => ({
        numero_expediente: e.numero_expediente,
        tipo_expediente: e.tipo_expediente,
        descripcion: e.descripcion,
        presentante: e.presentante || e.usuario_nombre || e.id_usuario_presentante || "",
        fecha: (e.fecha_creacion ? new Date(e.fecha_creacion).toLocaleDateString() : (e.fecha || "")),
        estado_actual: e.estado_actual,
      }));
      autoTable(doc, { columns, body: rows, startY: 28 });
      return doc.output('bloburl');
      } catch (err) {
        alert(`No se pudo generar el reporte: ${err?.message ?? err}`);
        return null;
      } finally {
        setGenerandoPDF(false);
      }
    };
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState("info"); // info | finalizados

  useEffect(() => {
    fetch("http://localhost:8000/expedientes/finalizados")
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener expedientes");
        return res.json();
      })
      .then((data) => {
        setExpedientes(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="expedientes-finalizados-page">
      <Header_1 />
      <div style={{ display: "flex", flex: 1 }}>
        <aside className={`juridico-sidebar${sidebarOpen ? " open" : " closed"}`}>
          <button className="juridico-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
          {sidebarOpen && (
            <nav className="juridico-menu">
              <button
                className={`juridico-menu-btn${view === "finalizados" ? " active" : ""}`}
                onClick={() => setView("finalizados")}
              >
                <span className="juridico-icon">✅</span>
                <span className="juridico-label">Finalizados</span>
              </button>
              <button
                className="juridico-menu-btn juridico-salir"
                onClick={() => navigate("/PortadaAdministrativo")}
              >
                <span className="juridico-icon">🚪</span>
                <span className="juridico-label">Salir</span>
              </button>
            </nav>
          )}
        </aside>
        <main className="juridico-main">
          <BotonesReporte
            onVolver={() => navigate("/consulta-expedientes-estado")}
            onGenerarPDF={exportarPDF}
            generando={generandoPDF}
            nombreArchivo="reporte_expedientes_finalizados.pdf"
          />
          <h2>Expedientes Finalizados</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : error ? (
            <p style={{ color: "red" }}>Error: {error}</p>
          ) : (
            <>

              <table className="expedientes-table">
                <thead>
                  <tr>
                    <th>N° Expediente</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Presentante</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(expedientes.length === 0
                    ? [
                        {
                          id_expediente: 1,
                          numero_expediente: "2025/0001",
                          tipo_expediente: "Permiso de obra",
                          descripcion: "Solicitud de permiso para obra hidráulica.",
                          usuario_nombre: "Juan",
                          usuario_apellido: "Pérez",
                          fecha_creacion: new Date("2025-11-01"),
                          estado_actual: "aprobado"
                        },
                        {
                          id_expediente: 3,
                          numero_expediente: "2025/0003",
                          tipo_expediente: "Solicitud de informe",
                          descripcion: "Pedido de informe sobre caudal de río.",
                          usuario_nombre: "Luis",
                          usuario_apellido: "Martínez",
                          fecha_creacion: new Date("2025-11-10"),
                          estado_actual: "aprobado"
                        }
                      ]
                    : expedientes.filter(e => e.estado_actual === "aprobado" || e.estado_actual === "rechazado")
                  ).map((exp) => (
                    <tr key={exp.id_expediente}>
                      <td>{exp.numero_expediente}</td>
                      <td>{exp.tipo_expediente}</td>
                      <td>{exp.descripcion}</td>
                      <td>{exp.usuario_nombre} {exp.usuario_apellido}</td>
                      <td>{new Date(exp.fecha_creacion).toLocaleDateString()}</td>
                      <td style={{ color: exp.estado_actual === 'aprobado' ? 'green' : 'red' }}>
                        {exp.estado_actual.charAt(0).toUpperCase() + exp.estado_actual.slice(1)}
                      </td>
                      <td>{exp.observaciones || "Sin observaciones"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ExpedientesFinalizados;
