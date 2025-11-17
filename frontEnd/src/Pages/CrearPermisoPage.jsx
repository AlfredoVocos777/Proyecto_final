import Header_1 from "../Components/Header_1";
import Footer from "../Components/Footer";
import CrearPermiso from "../Components/CrearPermiso";
import "../CSS/PageLayout.css";
import BackButton from "../Components/BackButton";

export default function CrearPermisoPage() {
  return (
    <div>
      <Header_1 />
      <BackButton />
      <main className="page-content">
        <CrearPermiso />
      </main>
      <Footer />
    </div>
  );
}
