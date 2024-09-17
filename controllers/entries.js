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
    .populate({path: 'book', select: 'coverUrl title subtitle description pageCount author genre'})
    return entry;
}


module.exports.getEntryByBook = async (bID) => {
    const entry = await Entry.findOne({book:bID});
    // console.log(entry);
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

module.exports.sortByShelf = async (entries) => {
    let read = [];
    let reading = [];
    let wanttoread = [];
    // console.log(read)
    for (let e of entries){
        if (e.shelf === 'Read'){
            read.push(e)
        } else if(e.shelf === 'Reading') {
            reading.push(e)
        } else if(e.shelf === 'Want to Read'){
            wanttoread.push(e);
        }
    }
    return {read,wanttoread,reading};
}