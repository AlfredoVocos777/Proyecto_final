import Header_1 from "../Components/Header_1";
import Footer from "../Components/Footer";
import UsuarioDirector from "../Components/UsuarioDirector";
import "../CSS/UsuarioDirectorPage.css";

export default function UsuarioDirectorPage() {
  return (
    <div className="usuario-director-page">
      <Header_1 />
      <UsuarioDirector />
      <Footer />
    </div>
  );
}
