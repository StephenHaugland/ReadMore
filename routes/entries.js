const express = require('express');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Book = require('../models/book');
const User = require('../models/user');


const {capitalizeString} = require('../utils/capitalizeString.js');

const {storeReturnTo, isLoggedIn, matchQueryString, isTemporaryBook, isValidBook,isEntryOwner,validateEntry} = require('../middleware');
const {createNewEntry, getEntry, updateEntry, deleteEntry, getEntryByBook, sortByShelf} = require('../controllers/entries');
const {addEntry, getAllEntries, removeEntry, getFilteredEntries} = require('../controllers/users');
const entries = require('../controllers/entries.js')


const router = express.Router();


// index page for all entries IF NO SHELF SPECIFIED
router.get('/',matchQueryString, isLoggedIn, catchAsync(entries.index))

// entries route IF SHELF PARAM SPECIFIED
router.get('/', isLoggedIn, catchAsync(entries.shelfIndex))

// render new entry form page
// router.get('/new', isLoggedIn, entries.renderNewForm)

// add 1 new entry to user
router.post('/',isLoggedIn, validateEntry, catchAsync(entries.createEntry))

// route to show entry edit page
// router.get('/:id/edit', isLoggedIn, isEntryOwner, catchAsync(entries.renderEdit))

// post route to update book
router.put('/:id',isLoggedIn, isEntryOwner, validateEntry, catchAsync(entries.updateEntry))

// retreive and show 1 entry
router.get('/:id',isLoggedIn, isEntryOwner, catchAsync(entries.showEntry))

// delete route to remove 1 entry by id
router.delete('/:id',isLoggedIn, isEntryOwner, catchAsync(entries.deleteEntry))



module.exports = router;