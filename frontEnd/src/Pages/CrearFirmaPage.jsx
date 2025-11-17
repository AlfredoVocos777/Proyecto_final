import Header_1 from "../Components/Header_1";
import Footer from "../Components/Footer";
import CrearFirmaDigital from "../Components/CrearFirmaDigital";
import "../CSS/PageLayout.css";
import BackButton from "../Components/BackButton";

export default function CrearFirmaPage() {
  return (
    <div>
      <Header_1 />
      <BackButton />
      <main className="page-content">
        <CrearFirmaDigital />
      </main>
      <Footer />
    </div>
  );
}
