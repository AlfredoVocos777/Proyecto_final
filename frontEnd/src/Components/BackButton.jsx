import { useNavigate } from "react-router-dom";
import "../CSS/common.css";

export default function BackButton({ to, label = "Volver" }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
      return;
    }
    // Volver un paso en el historial; si no hay, ir a portada admin como fallback
    try {
      navigate(-1);
    } catch {
      navigate("/PortadaAdministrativo");
    }
  };

  return (
    <div className="backbar">
      <button type="button" className="btn-back" onClick={handleClick}>
        ← {label}
      </button>
    </div>
  );
}
