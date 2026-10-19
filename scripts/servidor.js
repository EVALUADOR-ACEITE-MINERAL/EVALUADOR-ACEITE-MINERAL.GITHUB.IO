// Servidor estático mínimo, sin dependencias: `npm start` y abrir http://localhost:5173
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.resolve(__dirname, '..');
const PUERTO = Number(process.env.PORT) || 5173;
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

http.createServer((req, res) => {
  const ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const archivo = path.join(RAIZ, ruta === '/' ? 'index.html' : ruta);
  if (!archivo.startsWith(RAIZ + path.sep) || !TIPOS[path.extname(archivo)]) {
    res.writeHead(404); res.end('No encontrado'); return;
  }
  fs.readFile(archivo, (err, datos) => {
    if (err) { res.writeHead(404); res.end('No encontrado'); return; }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] });
    res.end(datos);
  });
}).listen(PUERTO, () => console.log(`Evaluador NTC 3284 en http://localhost:${PUERTO}`));
