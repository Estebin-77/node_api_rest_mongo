const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const { createApp } = require('../src/app');
const Book = require('../src/models/book.model');
const app = createApp({ apiKey: 'test-only-key' });
const sample = { title: 'Libro de prueba', author: 'Autor', genre: 'Novela', publication_date: '2020-02-29' };
let mongo;
before(async () => { mongo = await MongoMemoryServer.create(); await mongoose.connect(mongo.getUri()); });
after(async () => { await mongoose.disconnect(); if (mongo) await mongo.stop(); });
beforeEach(async () => { await Book.deleteMany({}); });
const write = method => request(app)[method]('/books').set('X-API-Key', 'test-only-key');

test('catálogo vacío devuelve 200 con una lista JSON', async () => {
  const result = await request(app).get('/books'); assert.equal(result.status, 200); assert.deepEqual(result.body, []);
});
test('crear, consultar, modificar, reemplazar y eliminar un libro', async () => {
  const created = await write('post').send(sample); assert.equal(created.status, 201);
  const url = '/books/' + created.body._id;
  assert.equal((await request(app).get(url)).body.title, sample.title);
  const patch = await request(app).patch(url).set('X-API-Key', 'test-only-key').send({ title: 'Nuevo título' });
  assert.equal(patch.status, 200); assert.equal(patch.body.author, sample.author);
  assert.equal((await request(app).put(url).set('X-API-Key', 'test-only-key').send({ title: 'Incompleto' })).status, 400);
  assert.equal((await request(app).put(url).set('X-API-Key', 'test-only-key').send({ ...sample, author: 'Otro autor' })).status, 200);
  const deleted = await request(app).delete(url).set('X-API-Key', 'test-only-key');
  assert.equal(deleted.status, 204); assert.equal(deleted.text, ''); assert.equal((await request(app).get(url)).status, 404);
});
test('rechaza cuerpos ausentes, tipos, campos vacíos y fechas imposibles', async () => {
  for (const body of [{}, [], { ...sample, title: 42 }, { ...sample, author: ' ' }, { ...sample, publication_date: '2026-02-30' }, { ...sample, unexpected: true }]) {
    assert.equal((await write('post').send(body)).status, 400);
  }
  assert.equal((await write('post')).status, 400);
  assert.equal(await Book.countDocuments(), 0);
});
test('rechaza JSON inválido y no revela errores internos', async () => {
  assert.equal((await write('post').set('Content-Type', 'application/json').send('{')).status, 400);
  assert.equal((await request(app).get('/books/invalid')).status, 400);
  assert.equal((await request(app).get('/books/000000000000000000000000')).status, 404);
});
test('visitantes pueden leer pero no modificar; sin clave se bloquean escrituras', async () => {
  assert.equal((await request(app).post('/books').send(sample)).status, 401);
  assert.equal((await request(createApp({ apiKey: null })).post('/books').send(sample)).status, 503);
  assert.equal(await Book.countDocuments(), 0);
});
test('health refleja la conexión y la portada no contiene la clave', async () => {
  assert.equal((await request(app).get('/health')).status, 200);
  const home = await request(app).get('/'); assert.equal(home.status, 200); assert.ok(!home.text.includes('test-only-key'));
});
