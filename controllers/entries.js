const Book = require('../models/book');
const User = require('../models/user');
const Entry = require('../models/entry');



// module.exports.addBookToShelf = async (book,uID, shelf) =>{
//     const targetShelf = "shelves." + shelf;
//     const user = await User.findOneAndUpdate({_id:uID},{
//         $push: {[targetShelf]: [book._id]}
//     });
//     await user.save();
//     // console.log(user);
// }

module.exports.createNewEntry = async (entry) =>  {
    // create new entry
    const newEntry = new Entry(entry);
    await newEntry.save();    
    return newEntry;
}

module.exports.getEntry = async (eID) =>{
    const entry = await Entry.findOne({_id:eID})
    .populate({path: 'book', select: 'title author fiction genre'})
    return entry;
}

module.exports.updateEntry = async (entry, eID) => {
    const updatedEntry = await Entry.findByIdAndUpdate(eID,{...entry});
    await updatedEntry.save();
}

// module.exports.updateBook = async (book,bID,uID, shelf) => {
//     //update book info
//     const updatedBook = await Book.findOneAndUpdate({_id:bID},
//         {...book},
//         {new: 'true'}
//     );
//     console.log(`updated book: ${updatedBook}`);
//     await updatedBook.save();

//     // add updated book to new shelf
//     // IF shelf is changed
//     // const targetShelf = "shelves." + shelf;
//     // const user = await User.findOneAndUpdate({_id:uID},{
//     //     $push: {[targetShelf]: [book._id]}
//     // });
//     return updatedBook;
// }

module.exports.deleteEntry = async (eID) => {
    await Entry.findOneAndDelete({_id:eID});
}

