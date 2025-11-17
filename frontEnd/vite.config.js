import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: '/index.html',
    // Configurar Chrome como navegador predeterminado
    // En Windows, puedes especificar la ruta completa a Chrome
    strictPort: false,
  }
})
