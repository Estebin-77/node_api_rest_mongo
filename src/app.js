const express = require('express');
const mongoose = require('mongoose');
const crypto = require('node:crypto');
const path = require('node:path');
require('dotenv').config();
const bookRoutes = require('./routes/book.routes');
const { mongoUri } = require('./mongo-config');

function createApp({ apiKey = process.env.API_KEY } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));
  app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
  app.get('/health', (req, res) => {
    const connected = mongoose.connection.readyState === 1;
    res.status(connected ? 200 : 503).json({ status: connected ? 'ok' : 'unavailable' });
  });
  app.use('/books', (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    if (!apiKey) return res.status(503).json({ message: 'Las modificaciones no están habilitadas.' });
    const expected = Buffer.from(apiKey), actual = Buffer.from(req.get('X-API-Key') || '');
    if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
      return res.status(401).json({ message: 'Se requiere una clave válida para modificar libros.' });
    }
    next();
  }, bookRoutes);
  app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada.' }));
  app.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') return res.status(400).json({ message: 'El JSON no es válido.' });
    if (error.type === 'entity.too.large') return res.status(413).json({ message: 'La solicitud es demasiado grande.' });
    console.error('Error al procesar la solicitud:', error.name);
    res.status(500).json({ message: 'No se pudo completar la operación.' });
  });
  return app;
}
async function start() {
  if (!process.env.MONGO_URL) throw new Error('Falta MONGO_URL');
  await mongoose.connect(mongoUri(), { dbName: process.env.MONGO_DB_NAME || 'books', serverSelectionTimeoutMS: 5000 });
  const server = createApp().listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('API de libros disponible.'));
  const shutdown = () => server.close(async () => { await mongoose.disconnect(); process.exit(0); });
  process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
}
if (require.main === module) start().catch(error => { console.error('No se pudo iniciar la API:', error.name); process.exitCode = 1; });
module.exports = { createApp };
