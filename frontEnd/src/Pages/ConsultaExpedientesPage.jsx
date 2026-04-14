import ConsultaExpedientes from "../Components/ConsultaExpedientes";
import Header_1 from "../Components/Header_1";
import Footer from "../Components/Footer";
import BackButton from "../Components/BackButton";

function ConsultaExpedientesPage() {
  return (
    <>
      <Header_1 />
      <BackButton />
      <ConsultaExpedientes ocultarPrioridad={true} />
      <Footer />
    </>
  );
}

export default ConsultaExpedientesPage;
