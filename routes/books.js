const express = require('express');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Book = require('../models/book');
const User = require('../models/user');

const {storeReturnTo, isLoggedIn, matchQueryString, isTemporaryBook, isValidBook} = require('../middleware');
const {createNewBook, getBook, updateBook, deleteBook, getAllBooks} = require('../controllers/books.js')
const {getEntryByBook} = require('../controllers/entries');




const router = express.Router();


router.get('/new',isLoggedIn, (req,res) => {
    req.session.returnTo = req.originalUrl;
    res.render('books/new')
})

// retreive and show 1 book from db
router.get('/:id', isValidBook, storeReturnTo, isLoggedIn, async(req,res)=>{
    const book = await getBook(req.params.id);
    console.log(`book object: ${book}`);
    const prevRoute = req.session.returnTo;
    // this book isn't being referenced to yet so temporarily store its ID in session
    req.session.orphanBookID = req.params.id;
    delete req.session.returnTo;
    res.render('books/show', {book,prevRoute})
})

// add 1 new book
router.post('/',storeReturnTo, isLoggedIn, async(req,res)=>{
    // req.session.returnTo = req.originalUrl;
    // console.log(`session: ${req.session}`)
    //NEW MONGO
    // addBookToShelf(book,r)
    const {book} = req.body;
    // const userID = res.locals.currentUser._id;
    const newBook = await createNewBook(book);
    // await addBookToShelf(newBook, userID, shelf);
    // console.log(res.locals.returnTo)
    res.redirect(`/books/${newBook._id}`);

    
})

// route to show book edit page
router.get('/:id/edit',isValidBook,isLoggedIn, async(req,res)=>{
    
    const book = await getBook(req.params.id);
    // console.log(`cover url = ${book.coverUrl}`);
    res.render('books/edit', {book})
})

// post route to update book
router.put('/:id',isValidBook, isLoggedIn, async(req,res)=>{ 
        const {id} = req.params;
        const {book} = req.body;
        const updatedBook = await updateBook(book,id);
        const updatedEntry = await getEntryByBook(id);
        const redirectUrl = (updatedEntry==null)?`/books/${id}`:`/entries/${updatedEntry._id}`;
        req.flash('success', "Successfully updated book details");
        res.redirect(redirectUrl);
})

// delete route to remove 1 book by id
router.delete('/:id', isValidBook, isLoggedIn, async (req,res)=>{
    const {id} = req.params;
    await deleteBook(id);
    req.flash('success', 'Successfully deleted book');

    res.redirect('/books');
})

module.exports = router;