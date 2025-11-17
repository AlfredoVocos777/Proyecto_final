import Header_1 from "../Components/Header_1";
import Footer from "../Components/Footer";
import CrearDepartamento from "../Components/CrearDepartamento";
import "../CSS/PageLayout.css";
import BackButton from "../Components/BackButton";

export default function CrearDepartamentoPage() {
  return (
    <div>
      <Header_1 />
      <BackButton />
      <main className="page-content">
        <CrearDepartamento />
      </main>
      <Footer />
    </div>
  );
}
