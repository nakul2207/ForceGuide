import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import manifest from './manifest.json'
import {crx} from '@crxjs/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),crx({ manifest})],
})
