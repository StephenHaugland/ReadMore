const Book = require('../models/book');
const Entry = require('../models/entry');
const {capitalizeString} = require('../utils/capitalizeString.js');


const {searchByTerm} = require('../bookapi.js')


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
    // retrieve a sample of random books from the DB
    const randBookSample = await Book.aggregate([{ $match: { $expr: { $gte: [ { $rand: {} }, 0.5 ] } } }, { $sample: { size: 35 } }]);

    if (!randBookSample){
        req.flash('error','Cannot find that book!');
        return res.redirect('/entries');
    }
  
    // get rid of all duplicates from random sample
    const uniqueBooks = [...new Map(randBookSample.map((b)=> [b.title, b])).values()];
   
    res.render('books/explore', {uniqueBooks});
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
    // book.genre.replace('%20&%20', ' %26 ');
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

module.exports.deleteOrphanBook = async (bID) => {
    await Book.findByIdAndDelete(bID);
}

module.exports.deleteBook = async (req,res)=>{
    const {id} = req.params;
    await Book.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted book');

    res.redirect('/entries');
}