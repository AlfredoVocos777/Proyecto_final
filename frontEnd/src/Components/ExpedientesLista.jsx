import { useState } from "react";
import ConsultaExpedientes from "./ConsultaExpedientes";

export default function ExpedientesLista({ estado }) {
  // El componente reutiliza ConsultaExpedientes, pero fuerza el filtro de estado
  const [filtroEstado, setFiltroEstado] = useState(estado || "");

  // Renderiza ConsultaExpedientes con el filtro de estado
  return (
    <ConsultaExpedientes
      filtroEstado={filtroEstado}
      setFiltroEstado={setFiltroEstado}
      ocultarAsignado={(estado || "").toLowerCase() === "en revisión"}
    />
  );
}
