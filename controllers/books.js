const Book = require('../models/book');
const User = require('../models/user');

module.exports.getAllBooks = async () => {
    return await Book.find({});
}

// module.exports.getUserLibrary = async (uID) =>{
    // const result = await User.findOne({_id:uID})
    // .populate({path: 'shelves.read',select: 'isbn title author genre fiction'})
    // .populate({path: 'shelves.reading',select: 'isbn title author genre fiction'})
    // .populate({path: 'shelves.wantToRead',select: 'isbn title author genre fiction'})
    // .select('shelves');
    // console.log(result.shelves);
    
    // return result.shelves;
// }

// module.exports.addBookToShelf = async (book,uID, shelf) =>{
//     const targetShelf = "shelves." + shelf;
//     const user = await User.findOneAndUpdate({_id:uID},{
//         $push: {[targetShelf]: [book._id]}
//     });
//     await user.save();
//     // console.log(user);
// }

module.exports.createNewBook = async (book) =>  {
    const newBook = new Book(book);
    await newBook.save();
    return newBook;
}

module.exports.getBook = async (bID) =>{
    const book = await Book.findOne({_id:bID})
    return book;
}

module.exports.updateBook = async (book,bID) => {
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