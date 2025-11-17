import React from 'react'
import Registro_usuario from '../Components/Registro_usuario'
import Header_1 from '../Components/Header_1'
import Footer from '../Components/Footer'
import BackButton from '../Components/BackButton'

const RegistroPage = () => {
  return (
    <div>
    <Header_1 />
    <BackButton />
        <Registro_usuario />
        <Footer />
    </div>
  )
}

export default RegistroPage