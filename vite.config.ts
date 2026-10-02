import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
// Single self-contained HTML (no network needed to load) so it opens straight from disk.
export default defineConfig({ plugins: [react(), viteSingleFile()], base: './' })
