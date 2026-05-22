import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LOGIN_USUARIO } from '../Routers/router'
import './PaginaWeb.css'

const PaginaWeb = () => {
  const navigate = useNavigate()

  const handleTramitesClick = () => {
    navigate(LOGIN_USUARIO)
  }

  return (
    <div className="pagina-web">
      <header className="pagina-web__header">
        <div className="pagina-web__brand">
          <img
            className="pagina-web__logo-img"
            src="https://www.dpatuc.gob.ar/static/media/Logo_DPA_blanco.593edd23943d92c42c85.png"
            alt="Logo DPA"
          />
          <div>
            <p className="pagina-web__brand-title">DPA</p>
            <p className="pagina-web__brand-subtitle">Dirección Provincial del Agua</p>
          </div>
        </div>
        <nav className="pagina-web__nav">
          <button className="pagina-web__nav-item inactive" disabled>Inicio</button>
          <button className="pagina-web__nav-item inactive" disabled>Contactos</button>
          <button className="pagina-web__nav-item inactive" disabled>Presentación</button>
          <button className="pagina-web__nav-item inactive" disabled>Misión</button>
          <button className="pagina-web__nav-item inactive" disabled>Autoridades</button>
          <button className="pagina-web__nav-item inactive" disabled>Licitaciones</button>
          <button className="pagina-web__nav-item" onClick={handleTramitesClick}>Trámites</button>
          <button className="pagina-web__nav-item inactive" disabled>Webmail</button>
        </nav>
      </header>

      <main className="pagina-web__main">
        <section className="pagina-web__hero">
          <div className="pagina-web__hero-copy">
            <span className="pagina-web__eyebrow">Gobierno de Tucumán</span>
            <h1>Desarrollando infraestructura hidráulica para el futuro de nuestra provincia.</h1>
            <p>Infraestructura hídrica sustentable, protección de cuencas y gestión eficiente para el crecimiento de Tucumán.</p>
            <div className="pagina-web__hero-actions">
              <button className="pagina-web__hero-button" onClick={handleTramitesClick}>Acceder a Trámites</button>
              <button className="pagina-web__hero-button inactive" disabled>Ver más</button>
            </div>
          </div>
          <div className="pagina-web__hero-visual">
            <div className="pagina-web__hero-image" />
            <div className="pagina-web__hero-card">
              <h2>Trámites en línea</h2>
              <p>Gestión de permisos de riego, vuelcos y certificados hídricos online.</p>
            </div>
          </div>
        </section>

        <section className="pagina-web__info-grid">
          <article className="pagina-web__info-card">
            <h3>Trámites</h3>
            <p>Accede al sistema SIGEDEX para iniciar, consultar o seguir el estado de tus trámites.</p>
            <button className="pagina-web__card-button" onClick={handleTramitesClick}>Ingresar a SIGEDEX</button>
          </article>
          <article className="pagina-web__info-card">
            <h3>Licitaciones</h3>
            <p>Seguimiento de obras públicas, pliegos y convocatorias vigentes.</p>
            <button className="pagina-web__card-button inactive" disabled>Ver Licitaciones</button>
          </article>
          <article className="pagina-web__info-card">
            <h3>GIS</h3>
            <p>Mapas, capas geoespaciales y monitoreo territorial para gestión hídrica.</p>
            <button className="pagina-web__card-button inactive" disabled>Ver GIS</button>
          </article>
        </section>

        <section className="pagina-web__section pagina-web__section--news">
          <div>
            <h2>Novedades</h2>
            <div className="pagina-web__card-list">
              <div className="pagina-web__news-card">
                <h4>Infraestructura hídrica prioritaria</h4>
                <p>Avanzamos en obras para garantizar el acceso al agua en toda la provincia.</p>
              </div>
              <div className="pagina-web__news-card">
                <h4>Cuencas sustentables</h4>
                <p>Protección ambiental y gestión estratégica de cuencas hídricas.</p>
              </div>
              <div className="pagina-web__news-card">
                <h4>Gestión digital</h4>
                <p>Trámites simplificados y seguimiento online para mayor transparencia.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="pagina-web__section pagina-web__section--video">
          <h2>Videos del Canal</h2>
          <div className="pagina-web__video-placeholder">Video del canal (simulado)</div>
        </section>
      </main>

      <footer className="pagina-web__footer">
        <div className="pagina-web__footer-block">
          <h3>Enlaces</h3>
          <p>Inicio</p>
          <p>Contactos</p>
          <p>Presentación de documentación</p>
          <p>Misión</p>
          <p>Autoridades</p>
          <p>Licitaciones</p>
          <p>Trámites</p>
          <p>Webmail</p>
        </div>
        <div className="pagina-web__footer-block">
          <h3>Contacto</h3>
          <p>Simón Bolívar 1095, S. M. de Tucumán</p>
          <p>424-3837</p>
          <p>mesadeentradas@dpatuc.com</p>
        </div>
        <div className="pagina-web__footer-block">
          <h3>Síguenos</h3>
          <p>Facebook</p>
          <p>Instagram</p>
          <p>YouTube</p>
          <img
            className="pagina-web__footer-logo"
            src="https://www.dpatuc.gob.ar/static/media/gobierno_logo.a6e15be26241261ac36c.png"
            alt="Logo Gobierno de Tucumán"
          />
        </div>
      </footer>
    </div>
  )
}

export default PaginaWeb
