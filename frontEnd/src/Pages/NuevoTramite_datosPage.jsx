import React from 'react'
import Nuevo_tramiteDatos from '../Components/Nuevo_tramiteDatos'
import Header_1 from '../Components/Header_1'
import Footer from '../Components/Footer'
import BackButton from '../Components/BackButton'

const NuevoTramiteDatosPage = () => {
  return (
    <div>
    <Header_1 />
    <BackButton />
        <Nuevo_tramiteDatos />
        <Footer />
    </div>
  )
}

export default NuevoTramiteDatosPage