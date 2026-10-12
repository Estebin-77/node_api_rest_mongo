require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/book.model');
async function seed() {
  if (!process.env.MONGO_URL) throw new Error('Falta MONGO_URL');
  await mongoose.connect(process.env.MONGO_URL, { dbName: process.env.MONGO_DB_NAME || 'books', serverSelectionTimeoutMS: 5000 });
  try {
    for (const book of [
      { title: 'Don Quijote de la Mancha', author: 'Miguel de Cervantes', genre: 'Novela', publication_date: '1605-01-01' },
      { title: 'Orgullo y prejuicio', author: 'Jane Austen', genre: 'Novela', publication_date: '1813-01-28' },
      { title: 'El principito', author: 'Antoine de Saint-Exupéry', genre: 'Fábula', publication_date: '1943-04-06' },
    ]) await Book.updateOne({ title: book.title, author: book.author }, { $setOnInsert: book }, { upsert: true });
    console.log('Catálogo de muestra preparado; las entradas existentes se conservan.');
  } finally { await mongoose.disconnect(); }
}
seed().catch(error => { console.error('No se pudo cargar el catálogo:', /auth/i.test(error.message || '') ? 'MongoDB rechazó las credenciales' : error.name, 'código:', error.code || 'sin código'); process.exitCode = 1; });
