import { BrowserRouter, Routes, Route } from "react-router-dom";

import { LOGIN_USUARIO , REGISTRO_USUARIO, NUEVO_TRAMITE_DATOS, NUEVO_TRAMITE, PORTADA, PORTADA_ADMINISTRATIVO, CONSULTA, CONSULTA_ADMIN, NUEVO_TRAMITE_PAGO, NUEVO_TRAMITE_EXPEDIENTES, CREAR_ROL, CREAR_PERMISO, CREAR_DEPARTAMENTO, CREAR_FIRMA, LISTAR_ROLES, LISTAR_PERMISOS, LISTAR_DEPARTAMENTOS, LISTAR_FIRMAS, LISTAR_USUARIOS, EDITAR_USUARIO, USUARIO_TECNICO, USUARIO_JURIDICO, USUARIO_DIRECTOR} from "./Routers/router";
import LoginPage from "./Pages/LoginPage";
import RegistroPage from "./Pages/RegistroPage";
import PortadaPage from "./Pages/PortadaPage";
import PortadaAdministrativoPage from "./Pages/PortadaAdministrativoPage";
import ConsultaExpedientesPage from "./Pages/ConsultaExpedientesPage";
import ConsultaAdminExpedientesPage from "./Pages/ConsultaAdminExpedientesPage";
import NuevoTramite_datosPage from "./Pages/NuevoTramite_datosPage";
import NuevoTramitePage from "./Pages/NuevoTramitePage";
import NuevoTramite_pagoPage from "./Pages/NuevoTramite_pagoPage";
import NuevoTramite_ExpedientePage from "./Pages/NuevoTramite_ExpedientePage";
import PagoExitosoPage from "./Pages/PagoExitosoPage";
import CrearRolPage from "./Pages/CrearRolPage";
import CrearPermisoPage from "./Pages/CrearPermisoPage";
import CrearDepartamentoPage from "./Pages/CrearDepartamentoPage";
import CrearFirmaPage from "./Pages/CrearFirmaPage";
import ListarRolesPage from "./Pages/ListarRolesPage";
import ListarPermisosPage from "./Pages/ListarPermisosPage";
import ListarDepartamentosPage from "./Pages/ListarDepartamentosPage";
import ListarFirmasPage from "./Pages/ListarFirmasPage";
import ListarUsuariosPage from "./Pages/ListarUsuariosPage";
import EditarUsuarioPage from "./Pages/EditarUsuarioPage";
import UsuarioTecnicoPage from "./Pages/UsuarioTecnicoPage";
import UsuarioJuridicoPage from "./Pages/UsuarioJuridicoPage";
import UsuarioDirectorPage from "./Pages/UsuarioDirectorPage";
import { RequireAdmin, RequireTecnico, RequireJuridico, RequireDirector } from "./Routers/guards";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path={LOGIN_USUARIO} element={<LoginPage />} />
        <Route path={REGISTRO_USUARIO} element={<RegistroPage />} />
        <Route path={PORTADA} element={<PortadaPage />} />
        <Route
          path={PORTADA_ADMINISTRATIVO}
          element={
            <RequireAdmin>
              <PortadaAdministrativoPage />
            </RequireAdmin>
          }
        />
        <Route path={CONSULTA} element={<ConsultaExpedientesPage />} />
        <Route path={CONSULTA_ADMIN} element={<RequireAdmin><ConsultaAdminExpedientesPage /></RequireAdmin>} />
  <Route path={CREAR_ROL} element={<RequireAdmin><CrearRolPage /></RequireAdmin>} />
  <Route path={CREAR_PERMISO} element={<RequireAdmin><CrearPermisoPage /></RequireAdmin>} />
  <Route path={CREAR_DEPARTAMENTO} element={<RequireAdmin><CrearDepartamentoPage /></RequireAdmin>} />
  <Route path={CREAR_FIRMA} element={<RequireAdmin><CrearFirmaPage /></RequireAdmin>} />
  <Route path={LISTAR_ROLES} element={<RequireAdmin><ListarRolesPage /></RequireAdmin>} />
  <Route path={LISTAR_PERMISOS} element={<RequireAdmin><ListarPermisosPage /></RequireAdmin>} />
  <Route path={LISTAR_DEPARTAMENTOS} element={<RequireAdmin><ListarDepartamentosPage /></RequireAdmin>} />
  <Route path={LISTAR_FIRMAS} element={<RequireAdmin><ListarFirmasPage /></RequireAdmin>} />
  <Route path={LISTAR_USUARIOS} element={<RequireAdmin><ListarUsuariosPage /></RequireAdmin>} />
  <Route path={EDITAR_USUARIO} element={<RequireAdmin><EditarUsuarioPage /></RequireAdmin>} />
  <Route path={USUARIO_TECNICO} element={<RequireTecnico><UsuarioTecnicoPage /></RequireTecnico>} />
  <Route path={USUARIO_JURIDICO} element={<RequireJuridico><UsuarioJuridicoPage /></RequireJuridico>} />
  <Route path={USUARIO_DIRECTOR} element={<RequireDirector><UsuarioDirectorPage /></RequireDirector>} />
        <Route path={NUEVO_TRAMITE_DATOS} element={<NuevoTramite_datosPage />} />
        <Route path={NUEVO_TRAMITE} element={<NuevoTramitePage />} />
        <Route path={NUEVO_TRAMITE_PAGO} element={<NuevoTramite_pagoPage />} />
        <Route path={NUEVO_TRAMITE_EXPEDIENTES} element={<NuevoTramite_ExpedientePage/>} />
  <Route path="/pago-exitoso" element={<PagoExitosoPage />} />
        <Route path="/pago-fallido" element={<div className="container mt-5"><h1>Pago Fallido</h1><p>El pago no pudo ser procesado. Por favor, intente nuevamente.</p></div>} />
        <Route path="/pago-pendiente" element={<div className="container mt-5"><h1>Pago Pendiente</h1><p>Su pago está pendiente de confirmación.</p></div>} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
