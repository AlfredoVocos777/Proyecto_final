import Header_1 from "../Components/Header_1";
import Footer from "../Components/Footer";
import UsuarioJuridico from "../Components/UsuarioJuridico";
import "../CSS/UsuarioJuridicoPage.css";

export default function UsuarioJuridicoPage() {
  return (
    <div className="usuario-juridico-page">
      <Header_1 />
      <UsuarioJuridico />
      <Footer />
    </div>
  );
}
