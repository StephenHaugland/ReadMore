const express = require('express');
const catchAsync = require('../utils/catchAsync');
const {storeReturnTo, isLoggedIn, validateBook} = require('../middleware');
const books = require('../controllers/books')

const router = express.Router();


router.get('/search', isLoggedIn, books.renderSearch)

router.post('/search', storeReturnTo, isLoggedIn, catchAsync(books.search))

// retrieve and show all books in the db
router.get('/explore', isLoggedIn, catchAsync(books.renderExplore))

router.get('/new',isLoggedIn, books.renderNewForm)

// retreive and show 1 book from db
router.get('/:id', storeReturnTo, isLoggedIn, catchAsync(books.showBook))

// add 1 new book
router.post('/',storeReturnTo, isLoggedIn, validateBook, catchAsync(books.createBook))

// route to show book edit page
router.get('/:id/edit',isLoggedIn, catchAsync(books.renderEditForm))

// post route to update book
router.put('/:id', isLoggedIn, validateBook, catchAsync(books.updateBook))

// delete route to remove 1 book by id
router.delete('/:id', isLoggedIn, catchAsync(books.deleteBook))

module.exports = router;