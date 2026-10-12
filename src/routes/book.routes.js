const router = require('express').Router();
const Book = require('../models/book.model');
async function getBook(req, res, next) {
  if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) return res.status(400).json({ message: 'El ID del libro no es válido.' });
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'No se encontró el libro.' });
    res.locals.book = book; next();
  } catch (error) { next(error); }
}
router.get('/', async (req, res, next) => {
  try { res.json(await Book.find().sort({ title: 1 }).limit(100)); } catch (error) { next(error); }
});
router.post('/', async (req, res, next) => {
  const message = Book.validateBook(req.body);
  if (message) return res.status(400).json({ message });
  try { res.status(201).json(await Book.create(req.body)); } catch (error) { next(error); }
});
router.get('/:id', getBook, (req, res) => res.json(res.locals.book));
function update(partial) {
  return async (req, res, next) => {
    const message = Book.validateBook(req.body, partial);
    if (message) return res.status(400).json({ message });
    try { Object.assign(res.locals.book, req.body); res.json(await res.locals.book.save()); } catch (error) { next(error); }
  };
}
router.put('/:id', getBook, update(false));
router.patch('/:id', getBook, update(true));
router.delete('/:id', getBook, async (req, res, next) => {
  try { await res.locals.book.deleteOne(); res.status(204).end(); } catch (error) { next(error); }
});
module.exports = router;


