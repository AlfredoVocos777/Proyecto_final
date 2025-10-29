import { BrowserRouter, Routes, Route } from "react-router-dom";

import { LOGIN_USUARIO , REGISTRO_USUARIO, NUEVO_TRAMITE_DATOS, NUEVO_TRAMITE, PORTADA, NUEVO_TRAMITE_PAGO, NUEVO_TRAMITE_EXPEDIENTES} from "./Routers/router";
import LoginPage from "./Pages/LoginPage";
import RegistroPage from "./Pages/RegistroPage";
import PortadaPage from "./Pages/PortadaPage";
import NuevoTramite_datosPage from "./Pages/NuevoTramite_datosPage";
import NuevoTramitePage from "./Pages/NuevoTramitePage";
import NuevoTramite_pagoPage from "./Pages/NuevoTramite_pagoPage";
import NuevoTramite_ExpedientePage from "./Pages/NuevoTramite_ExpedientePage";

function App() {
  

  return (
    <> 
    <BrowserRouter>
      <Routes>
        <Route path= "/" element={<LoginPage />} /> {/* ruta para la pagina Login usuarios */}
        <Route path= {REGISTRO_USUARIO} element={<RegistroPage />} /> {/* ruta para la pagina Registro usuarios */}
        <Route path= {NUEVO_TRAMITE_DATOS} element={<NuevoTramite_datosPage />} /> {/* ruta para la pagina NuevoTramitePage */}
        <Route path= {NUEVO_TRAMITE} element={<NuevoTramitePage />} /> {/* ruta para la pagina NuevoTramitePage */}
        <Route path= {PORTADA} element={<PortadaPage />} /> {/* ruta para la pagina PortadaPage */}
        <Route path= {NUEVO_TRAMITE_PAGO} element={<NuevoTramite_pagoPage />} /> {/* ruta para la pagina NuevoTramitePage */}
        <Route path={NUEVO_TRAMITE_EXPEDIENTES} element={<NuevoTramite_ExpedientePage/>} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App