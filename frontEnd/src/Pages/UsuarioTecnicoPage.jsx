import Header_1 from "../Components/Header_1";
import Footer from "../Components/Footer";
import UsuarioTecnico from "../Components/UsuarioTecnico";
import "../CSS/UsuarioTecnicoPage.css";

export default function UsuarioTecnicoPage() {
  return (
    <div className="usuario-tecnico-page">
      <Header_1 />
      <UsuarioTecnico />
      <Footer />
    </div>
  );
}
