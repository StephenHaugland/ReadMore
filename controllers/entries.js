const Book = require('../models/book');
const User = require('../models/user');
const Entry = require('../models/entry');

module.exports.getUserEntries = async (uID) =>{
    const user = await User.findOne({_id:uID})
    .populate({path: 'entries',select: 'book shelf notes'})
    .populate({path: 'entries.book', select: 'title author'})
    .select('entries');
    console.log(user.entries);
    return user.entries;
}

module.exports.addBookToShelf = async (book,uID, shelf) =>{
    const targetShelf = "shelves." + shelf;
    const user = await User.findOneAndUpdate({_id:uID},{
        $push: {[targetShelf]: [book._id]}
    });
    await user.save();
    // console.log(user);
}

module.exports.createNewBook = async (book) =>  {
    const newBook = new Book(book);
    await newBook.save();
    return newBook;
}

module.exports.getBook = async (bID) =>{
    const book = await Book.findOne({_id:bID})
    return book;
}

module.exports.updateBook = async (book,bID,uID, shelf) => {
    //update book info
    const updatedBook = await Book.findOneAndUpdate({_id:bID},
        {...book},
        {new: 'true'}
    );
    console.log(`updated book: ${updatedBook}`);
    await updatedBook.save();

    // add updated book to new shelf
    // IF shelf is changed
    // const targetShelf = "shelves." + shelf;
    // const user = await User.findOneAndUpdate({_id:uID},{
    //     $push: {[targetShelf]: [book._id]}
    // });
    return updatedBook;
}

module.exports.deleteBook = async (bID) => {
    await Book.findByIdAndDelete(bID);
}