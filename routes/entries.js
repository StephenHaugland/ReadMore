const express = require('express');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Book = require('../models/book');
const User = require('../models/user');


const {capitalizeString} = require('../utils/capitalizeString.js');

const {storeReturnTo, isLoggedIn, matchQueryString, isTemporaryBook, isValidBook,isEntryOwner,validateEntry} = require('../middleware');
const {createNewEntry, getEntry, updateEntry, deleteEntry, getEntryByBook, sortByShelf} = require('../controllers/entries');
const {addEntry, getAllEntries, removeEntry, getFilteredEntries} = require('../controllers/users');



const router = express.Router();


// index page for all entries IF NO SHELF SPECIFIED
router.get('/',matchQueryString, isLoggedIn, catchAsync(async (req,res)=>{
    let filter = "";
    const userID = res.locals.currentUser._id;
    let filteredEntries = '';
    const entries = await getAllEntries(userID);
    let shelfSortedEntries = '';
    if (req.query.genre){
        filter = capitalizeString(req.query.genre);
        console.log(`filter parameter: ${filter}`);
        
            filteredEntries = await getFilteredEntries(filter, entries);
            // console.log(filteredEntries);
            shelfSortedEntries = await sortByShelf(filteredEntries);
        
        
    } else {
        shelfSortedEntries = await sortByShelf(entries);
        
    }
    // console.log(shelfSortedEntries);
    // console.log(`filteredentries: ${filteredEntries}`);
    res.render('entries/index', {shelfSortedEntries, filteredEntries, filter});
}))

// entries route IF SHELF PARAM SPECIFIED
router.get('/', isLoggedIn, catchAsync(async(req,res)=>{
    let shelf = req.query.shelf;
    // console.log(`shelf: ${shelf}`)
    let filter = "";
    const userID = res.locals.currentUser._id;
    let filteredEntries = '';
    const entries = await getAllEntries(userID);
    let shelfSortedEntries = await sortByShelf(entries);
    if (req.query.genre){
        filter = capitalizeString(req.query.genre);
        // console.log(`filter parameter: ${filter}`);
        try{
            // console.log( shelfSortedEntries[shelf])
            filteredEntries = await getFilteredEntries(filter, shelfSortedEntries[shelf]);
            // console.log(filteredEntries);
            

        }
        catch(e){
            console.log(e)
        }
    }
    res.render(`entries/shelf`, {shelfSortedEntries, filteredEntries, filter, shelf})
}))

// render new entry form page
router.get('/new', isLoggedIn,(req,res) => {
    res.render('entries/new');
})


// add 1 new entry to user
router.post('/',isLoggedIn, validateEntry, catchAsync(async(req,res)=>{
    // create new entry using data supplied from form
    const {entry} = req.body;
    // console.log(`entry from form: ${{entry}}`);
    const newEntry = await createNewEntry(entry);
    // console.log(`entry created from db: ${newEntry}`)

    // add newly created entry to user profile
    const userID = res.locals.currentUser._id;
    await addEntry(newEntry, userID);

    req.flash('success', "Successfully added book to library");

    res.redirect(`/entries/${newEntry._id}`);
}))



// route to show entry edit page
router.get('/:id/edit', isLoggedIn, isEntryOwner, catchAsync(async(req,res)=>{
    const entry = await getEntry(req.params.id);
    res.render('entries/edit', {entry})
}))

// post route to update book
router.put('/:id',isLoggedIn, isEntryOwner, validateEntry, catchAsync(async(req,res)=>{
    const {id} = req.params;
    const {entry} = req.body;
    await updateEntry(entry,id);
    req.flash('success', "Successfully updated entry details");
    res.redirect(`/entries/${id}`);
}))

// retreive and show 1 entry
router.get('/:id',isLoggedIn, isEntryOwner, catchAsync(async(req,res)=>{
    const entry = await getEntry(req.params.id);
    // console.log(`page count is : ${entry.book.pageCount}`)
    // const {book, shelf, notes} = entry;
    // console.log(`book cover img: ${entry.book.coverUrl}`)
    res.render('entries/show', {entry})
}))

// delete route to remove 1 entry by id
router.delete('/:id',isLoggedIn, isEntryOwner, catchAsync(async (req,res)=>{
    const {id} = req.params;
    const userID = res.locals.currentUser._id;

    await removeEntry(id, userID);

    await deleteEntry(id);
    req.flash('success', 'Successfully removed book from library');

    res.redirect('/entries');
}))



module.exports = router;