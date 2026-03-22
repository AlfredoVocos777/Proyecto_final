import Header_1 from "../Components/Header_1";
import Footer from "../Components/Footer";
// import UsuarioJuridico from "../Components/UsuarioJuridico"; // Archivo eliminado en la rama modificacionesJM
import "../CSS/UsuarioJuridicoPage.css";

export default function UsuarioJuridicoPage() {
  return (
    <div className="usuario-juridico-page">
      <Header_1 />
      <div style={{minHeight:"50vh", display: "flex", justifyContent:"center", alignItems:"center"}}>
        <h3>El componente UsuarioJuridico fue eliminado en la rama de tu compañero</h3>
      </div>
      <Footer />
    </div>
  );
}
