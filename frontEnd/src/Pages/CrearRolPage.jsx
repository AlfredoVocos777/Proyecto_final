import Header_1 from "../Components/Header_1";
import Footer from "../Components/Footer";
import CrearRol from "../Components/CrearRol";
import "../CSS/PageLayout.css";
import BackButton from "../Components/BackButton";

export default function CrearRolPage() {
  return (
    <div>
      <Header_1 />
      <BackButton />
      <main className="page-content">
        <CrearRol />
      </main>
      <Footer />
    </div>
  );
}
