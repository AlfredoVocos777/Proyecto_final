import React, { useState } from "react";
import BackButton from "./BackButton";

export default function ConsultaAdminExpedientes() {
	const [vista, setVista] = useState("");
	return (
		<div className="admin-hero">
			<div className="admin-wrap">
				<h1 className="admin-title">Dirección Provincial del Agua</h1>
				<p className="admin-subtitle">SIGEDEX · Panel administrativo</p>
				<div className="admin-card">
					<div className="admin-actions">
						<button className="admin-btn primary" onClick={() => setVista("consultar")}>Consultar Expedientes</button>
						<button className="admin-btn success" onClick={() => setVista("asignar")}>Asignar Expedientes</button>
					</div>
					{/* Renderiza el contenido según la vista seleccionada */}
					{vista === "consultar" && (
						<div style={{marginTop: '18px'}}>
							<p>Vista de consulta de expedientes</p>
						</div>
					)}
					{vista === "asignar" && (
						<div style={{marginTop: '18px'}}>
							<p>Vista de asignación de expedientes</p>
						</div>
					)}
					{/* Botón volver atrás debajo de los botones principales */}
					<div style={{width: '100%', marginTop: '18px'}}>
						<BackButton label="Volver atrás" />
					</div>
				</div>
			</div>
		</div>
	);
}
