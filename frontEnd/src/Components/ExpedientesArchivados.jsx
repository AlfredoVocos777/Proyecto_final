
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Header_1 from "./Header_1";
import Footer from "./Footer";
import "../CSS/common.css";
import "../CSS/UsuarioJuridico.css";

const ExpedientesArchivados = () => {
  const [expedientes, setExpedientes] = useState([]);
    // Función para exportar la tabla a PDF
    const exportarPDF = () => {
      const doc = new jsPDF();
      const fecha = new Date().toLocaleString();
      doc.text("Reporte de Expedientes Archivados", 14, 15);
      doc.setFontSize(10);
      doc.text(`Fecha: ${fecha}`, 14, 22);

      const columns = [
        { header: "N° Expediente", dataKey: "numero_expediente" },
        { header: "Tipo", dataKey: "tipo_expediente" },
        { header: "Descripción", dataKey: "descripcion" },
        { header: "Presentante", dataKey: "presentante" },
        { header: "Fecha", dataKey: "fecha" },
      ];
      const rows = expedientes.map(e => ({
        numero_expediente: e.numero_expediente,
        tipo_expediente: e.tipo_expediente,
        descripcion: e.descripcion,
        presentante: e.usuario_nombre + ' ' + (e.usuario_apellido || ''),
        fecha: e.fecha_creacion ? new Date(e.fecha_creacion).toLocaleDateString() : '',
      }));
      doc.autoTable({ columns, body: rows, startY: 28 });
      doc.save("reporte_expedientes_archivados.pdf");
    };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState("info"); // info | archivados | desarchivar
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    if (view === "archivados") {
      setLoading(true);
      fetch("http://localhost:3001/expediente?estado=archivado")
        .then((res) => {
          if (!res.ok) throw new Error("Error al obtener expedientes archivados");
          return res.json();
        })
        .then((data) => {
          setExpedientes(data.filter(e => e.estado_actual === "archivado"));
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [view]);

  return (
    <div className="expedientes-archivados-page juridico-layout">
      <Header_1 />
      <div style={{ display: "flex", flex: 1 }}>
        <aside className={`juridico-sidebar${sidebarOpen ? " open" : " closed"}`}>
          <button className="juridico-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
          {sidebarOpen && (
            <nav className="juridico-menu">
              <button
                className={`juridico-menu-btn${view === "archivados" ? " active" : ""}`}
                onClick={() => setView("archivados")}
              >
                <span className="juridico-icon">📦</span>
                <span className="juridico-label">Archivados</span>
              </button>
              <button
                className={`juridico-menu-btn${view === "desarchivar" ? " active" : ""}`}
                onClick={() => setView("desarchivar")}
              >
                <span className="juridico-icon">↩️</span>
                <span className="juridico-label">Desarchivar</span>
              </button>
              <button
                className="juridico-menu-btn juridico-salir"
                onClick={() => window.location.href = "/PortadaAdministrativo"}
              >
                <span className="juridico-icon">🚪</span>
                <span className="juridico-label">Salir</span>
              </button>
            </nav>
          )}
        </aside>
        <main className="juridico-main">
          {view === "info" && (
            <div className="seccion-contenido seccion-inicio">
              <h1>Expedientes Archivados</h1>
              <p>Bienvenido a la sección de expedientes archivados. Aquí puedes consultar los expedientes que han sido archivados, y gestionar su desarchivo si es necesario.</p>
              <div className="alert alert-info mt-4" style={{ background: "#eaf6fb", border: "1px solid #b6e0fe" }}>
                <strong>📦 Archivados:</strong> Visualiza todos los expedientes que han sido archivados.<br />
                <strong>↩️ Desarchivar:</strong> Recupera expedientes archivados para volver a gestionarlos.<br />
                <strong>🚪 Salir:</strong> Regresa al panel administrativo.
              </div>
            </div>
          )}
          {view === "archivados" && (
            <div className="seccion-contenido">
              <h2>📦 Lista de Expedientes Archivados</h2>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                <button className="admin-btn primary" onClick={exportarPDF}>
                  Generar reporte PDF
                </button>
              </div>
              {loading ? (
                <p>Cargando...</p>
              ) : error ? (
                <p style={{ color: "red" }}>Error: {error}</p>
              ) : (
                <div className="tabla-container">
                  <table className="expedientes-table">
                    <thead>
                      <tr>
                        <th>N° Expediente</th>
                        <th>Tipo</th>
                        <th>Descripción</th>
                        <th>Presentante</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expedientes.length === 0 ? (
                        <tr><td colSpan={5}>No hay expedientes archivados.</td></tr>
                      ) : (
                        expedientes.map((exp) => (
                          <tr key={exp.id_expediente}>
                            <td>{exp.numero_expediente}</td>
                            <td>{exp.tipo_expediente}</td>
                            <td>{exp.descripcion}</td>
                            <td>{exp.usuario_nombre} {exp.usuario_apellido}</td>
                            <td>{new Date(exp.fecha_creacion).toLocaleDateString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {view === "desarchivar" && (
            <div className="seccion-contenido">
              <h2>↩️ Desarchivar Expediente</h2>
              <p>Funcionalidad para desarchivar expedientes (próximamente).</p>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ExpedientesArchivados;
