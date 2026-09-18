import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// GitHub Pages sert le site depuis /carbumap/, Capacitor depuis la racine de l'APK.
// Sans ce réglage, l'un des deux builds cherche ses fichiers au mauvais endroit et n'affiche
// qu'une page blanche. Le workflow Pages renseigne VITE_BASE ; partout ailleurs, la racine.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
});
