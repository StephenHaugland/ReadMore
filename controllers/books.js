const Book = require('../models/book');
const User = require('../models/user');
const Entry = require('../models/entry');
const _ = require('underscore');
const {capitalizeString} = require('../utils/capitalizeString.js');


const {searchByTerm, getVolumeData, getSingleVolumeData} = require('../bookapi.js')


module.exports.renderSearch = (req,res)=>{
    let populate=false ;
    res.render('search', {populate});
}

module.exports.search = async(req,res)=>{
    req.session.returnTo = req.originalUrl

    const results = await searchByTerm(req.body.q);
    if (!results){
        req.flash('error','Cannot find that book!');
        return res.redirect('/entries');
    }
    populate = true;
    res.render('search', {results, populate});

}

module.exports.renderExplore = async (req,res)=>{
    // const userID = res.locals.currentUser._id;
    const books = await Book.find({});
    if (!books){
        req.flash('error','Cannot find that book!');
        return res.redirect('/entries');
    }
    // pick n random books from all books in DB
    let randCollection = _.sample(books,25);
    // console.log(randCollection)

    res.render('books/explore', {randCollection});
}



module.exports.getAllBooks = async () => {
    return await Book.find({});
}

module.exports.renderNewForm = (req,res) => {
    req.session.returnTo = req.originalUrl;
    res.render('books/new');
}


module.exports.showBook = async(req,res)=>{
    const book = await Book.findOne({_id:req.params.id});
    if (!book){
        req.flash('error','Cannot find that book!');
        return res.redirect('/entries');
    }
    // console.log(`book object: ${book}`);
    const prevRoute = req.session.returnTo;
    // this book isn't being referenced to yet so temporarily store its ID in session
    req.session.orphanBookID = req.params.id;
    delete req.session.returnTo;
    res.render('books/show', {book,prevRoute})
}

module.exports.createBook = async(req,res)=>{
    const {book} = req.body;
    if (!book){
        req.flash('error','Error creating that book!');
        return res.redirect('/entries');
    }
    let caseCorrectedGenre = capitalizeString(book.genre);
    // console.log(caseCorrectedGenre);
    book.genre = caseCorrectedGenre;
    // const userID = res.locals.currentUser._id;
    const newBook = new Book(book);
    await newBook.save();
    res.redirect(`/books/${newBook._id}`);
}

module.exports.renderEditForm = async(req,res)=>{
    const book = await Book.findOne({_id:req.params.id});
    if (!book){
        req.flash('error','Cannot find that book!');
        return res.redirect('/entries');
    }
    res.render('books/edit', {book})
}

module.exports.updateBook = async(req,res)=>{ 
    const {id} = req.params;
    const {book} = req.body;
    const updatedBook = await Book.findOneAndUpdate({_id:id},
        {...book},
        {new: 'true'}
    );
    await updatedBook.save();
    if (!updatedBook || !book){
        req.flash('error','Cannot find that book!');
        return res.redirect('/entries');
    }
    const updatedEntry = await Entry.findOne({book:id});
    const redirectUrl = (updatedEntry==null)?`/books/${id}`:`/entries/${updatedEntry._id}`;
    req.flash('success', "Successfully updated book details");
    res.redirect(redirectUrl);
}


// module.exports.updateBook = async (book,bID) => {
//     //update book info
//     const updatedBook = await Book.findOneAndUpdate({_id:bID},
//         {...book},
//         {new: 'true'}
//     );
//     await updatedBook.save();


//     return updatedBook;
// }

// module.exports.deleteBook = async (bID) => {
//     await Book.findByIdAndDelete(bID);
// }

module.exports.deleteBook = async (req,res)=>{
    const {id} = req.params;
    await Book.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted book');

    res.redirect('/books');
}