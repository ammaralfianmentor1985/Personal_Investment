// Turns the single-file Vite build into the fragment the Claude Artifact tool publishes
// (no <html>/<head>/<body>; own <title> and <style> first).
import { readFileSync, writeFileSync } from 'node:fs'
const html = readFileSync('dist/index.html', 'utf8')
const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n')
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1])
if (!styles || !scripts.length) throw new Error('build output not recognised')
const fonts = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap'
const out = `<title>Ledger Portfolio</title>
<link rel="stylesheet" href="${fonts}">
<style>${styles}</style>
<div id="root"></div>
${scripts.map(s => `<script type="module">${s}</script>`).join('\n')}
`
writeFileSync(process.argv[2] ?? 'artifact/ledger.html', out)
console.log('wrote', out.length, 'bytes')
