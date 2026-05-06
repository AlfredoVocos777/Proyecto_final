import Header_1 from "../Components/Header_1";
import Footer from "../Components/Footer";
import ConsultaAdminExpedientes from "../Components/ConsultaAdminExpedientes";
import BackButton from "../Components/BackButton";

export default function ConsultaAdminExpedientesPage() {
  return (
    <div>
      <Header_1 />
      <main className="page-content">
        <ConsultaAdminExpedientes />
      </main>
      <Footer />
    </div>
  );
}
