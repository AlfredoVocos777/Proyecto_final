import { useState } from "react";
import { useNavigate } from "react-router-dom";

const styles = {
  barra: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  btnVolver: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "9px 20px",
    borderRadius: "8px",
    border: "1.5px solid #cbd5e1",
    background: "#f8fafc",
    color: "#374151",
    fontWeight: 600,
    fontSize: "0.92rem",
    cursor: "pointer",
    transition: "all 0.18s",
    letterSpacing: "0.01em",
    boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
  },
  btnPDF: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "9px 22px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.92rem",
    cursor: "pointer",
    transition: "all 0.18s",
    letterSpacing: "0.01em",
    boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
  },
  btnPDFDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.7)",
    backdropFilter: "blur(3px)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "fadeIn 0.18s ease",
  },
  modal: {
    background: "#fff",
    borderRadius: "14px",
    width: "93vw",
    maxWidth: 1100,
    height: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 20px",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc",
    borderRadius: "14px 14px 0 0",
  },
  modalTitulo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: 700,
    fontSize: "1rem",
    color: "#1e293b",
  },
  iconoPDF: {
    width: 32,
    height: 32,
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    borderRadius: "7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "1rem",
    flexShrink: 0,
  },
  accionesModal: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  btnDescargar: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 18px",
    borderRadius: "7px",
    background: "linear-gradient(135deg, #16a34a, #15803d)",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.87rem",
    textDecoration: "none",
    boxShadow: "0 2px 6px rgba(22,163,74,0.25)",
    transition: "opacity 0.15s",
    border: "none",
    cursor: "pointer",
  },
  btnCerrar: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 16px",
    borderRadius: "7px",
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#64748b",
    fontWeight: 600,
    fontSize: "0.87rem",
    cursor: "pointer",
    transition: "all 0.15s",
  },
};

export default function BotonesReporte({ onVolver, onGenerarPDF, generando, nombreArchivo = "reporte.pdf", mostrarVolver = true }) {
  const navigate = useNavigate();
  const handleVolver = onVolver ?? (() => navigate(-1));
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleGenerar = async () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    const url = await onGenerarPDF();
    if (url) setPdfUrl(url);
  };

  const cerrarModal = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        .btn-volver:hover { background: #f1f5f9 !important; border-color: #94a3b8 !important; transform: translateX(-2px); }
        .btn-pdf:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(37,99,235,0.35) !important; }
        .btn-descargar:hover { opacity: 0.88; }
        .btn-cerrar:hover { background: #f1f5f9 !important; border-color: #94a3b8 !important; }
        .modal-animado { animation: slideUp 0.22s ease; }
      `}</style>

      <div style={styles.barra}>
        {mostrarVolver && (
        <button
          className="btn-volver"
          style={styles.btnVolver}
          onClick={handleVolver}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver
        </button>
        )}

        <button
          className="btn-pdf"
          style={{ ...styles.btnPDF, ...(generando ? styles.btnPDFDisabled : {}) }}
          onClick={handleGenerar}
          disabled={generando}
        >
          {generando ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Generando…
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
              </svg>
              Generar reporte PDF
            </>
          )}
        </button>
      </div>

      {pdfUrl && (
        <div style={styles.overlay}>
          <div className="modal-animado" style={styles.modal}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitulo}>
                <span style={styles.iconoPDF}>📄</span>
                <div>
                  <div style={{ lineHeight: 1.2 }}>Vista previa del reporte</div>
                  <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 400 }}>{nombreArchivo}</div>
                </div>
              </div>
              <div style={styles.accionesModal}>
                <a
                  href={pdfUrl}
                  download={nombreArchivo}
                  className="btn-descargar"
                  style={styles.btnDescargar}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Descargar
                </a>
                <button className="btn-cerrar" style={styles.btnCerrar} onClick={cerrarModal}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Cerrar
                </button>
              </div>
            </div>
            <iframe
              src={pdfUrl}
              style={{ flex: 1, border: "none", width: "100%" }}
              title="Vista previa reporte PDF"
            />
          </div>
        </div>
      )}
    </>
  );
}
