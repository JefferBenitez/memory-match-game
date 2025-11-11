import { defineConfig } from 'vite'

export default defineConfig({
  // Carpeta principal del proyecto
  root: 'www',

  // Configuración del build optimizado
  build: {
    outDir: '../dist',     // salida del bundle
    emptyOutDir: true,     // limpia la carpeta antes del build
    rollupOptions: {
      input: 'www/index.html'
    }
  },

})
