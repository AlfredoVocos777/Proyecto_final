import React, { useState } from "react";
import BackButton from "./BackButton";
import { useNavigate } from "react-router-dom";

export default function ConsultaAdminExpedientes() {
	const [vista, setVista] = useState("");
	const navigate = useNavigate();
	return (
		<div className="admin-hero">
			<div className="admin-wrap">
				<h1 className="admin-title">Dirección Provincial del Agua</h1>
				<p className="admin-subtitle">SIGEDEX · Panel administrativo</p>
				<div className="admin-card">
					<div className="admin-actions">
						<button className="admin-btn primary" onClick={() => navigate('/consulta-expedientes-estado')}>Consultar Expedientes</button>
						<button className="admin-btn success" onClick={() => setVista("asignar")}>Asignar Expedientes</button>
					</div>
					{vista === "asignar" && (
						<div style={{marginTop: '18px'}}>
							<p>Vista de asignación de expedientes</p>
						</div>
					)}
					<div style={{width: '100%', marginTop: '18px'}}>
						<BackButton label="Volver atrás" />
					</div>
				</div>
			</div>
		</div>
	);
}
