const mongoose = require('mongoose');
const fields = ['title', 'author', 'genre', 'publication_date'];
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  author: { type: String, required: true, trim: true, maxlength: 120 },
  genre: { type: String, required: true, trim: true, maxlength: 80 },
  publication_date: { type: String, required: true },
}, { bufferCommands: false });
function validateBook(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Envía un objeto JSON.';
  const keys = Object.keys(body);
  if (keys.some(key => !fields.includes(key))) return 'La solicitud contiene campos desconocidos.';
  if (!keys.length) return 'Envía al menos un campo.';
  if (!partial && fields.some(key => !Object.hasOwn(body, key))) return 'Título, autor, género y fecha son obligatorios.';
  const limits = { title: 200, author: 120, genre: 80, publication_date: 10 };
  for (const key of keys) {
    if (typeof body[key] !== 'string' || !body[key].trim() || body[key].trim().length > limits[key]) return 'Campos inválidos: usa texto no vacío y respeta su longitud máxima.';
  }
  if (Object.hasOwn(body, 'publication_date')) {
    const value = body.publication_date.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'La fecha debe usar YYYY-MM-DD.';
    const date = new Date(value + 'T00:00:00Z');
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return 'La fecha no es válida.';
  }
  return null;
}
module.exports = mongoose.model('Book', bookSchema);
module.exports.validateBook = validateBook;
