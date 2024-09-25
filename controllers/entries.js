const Book = require('../models/book');
const User = require('../models/user');
const Entry = require('../models/entry');
const {addEntry, getAllEntries, removeEntry, getFilteredEntries} = require('../controllers/users');
const {capitalizeString} = require('../utils/capitalizeString.js');




module.exports.index = async (req,res)=>{
    let filter = "";
    const userID = res.locals.currentUser._id;
    let filteredEntries = '';
    const entries = await getAllEntries(userID);
    let shelfSortedEntries = '';
    if (req.query.genre){
        filter = capitalizeString(req.query.genre);
        console.log(`filter parameter: ${filter}`);
            filteredEntries = await getFilteredEntries(filter, entries);
            shelfSortedEntries = await this.sortByShelf(filteredEntries);
    } else {
        shelfSortedEntries = await this.sortByShelf(entries);
        
    }
    res.render('entries/index', {shelfSortedEntries, filteredEntries, filter});
}

module.exports.shelfIndex = async(req,res)=>{
    let shelf = req.query.shelf;
    let filter = "";
    const userID = res.locals.currentUser._id;
    let filteredEntries = '';
    const entries = await getAllEntries(userID);
    let shelfSortedEntries = await this.sortByShelf(entries);
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
}


module.exports.renderNewForm = (req,res) => {
    res.render('entries/new');
}

module.exports.createEntry = async(req,res)=>{
    // create new entry using data supplied from form
    const {entry} = req.body;
    // const newEntry = await createNewEntry(entry);
    const newEntry = new Entry(entry);
    await newEntry.save();    
    // add newly created entry to user profile
    const userID = res.locals.currentUser._id;
    await addEntry(newEntry, userID);
    req.flash('success', "Successfully added book to library");
    res.redirect(`/entries/${newEntry._id}`);
}

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

module.exports.updateEntry = async(req,res)=>{
    const {id} = req.params;
    const {entry} = req.body;
    // await updateEntry(entry,id);
    const updatedEntry = await Entry.findByIdAndUpdate(id,{...entry});
    await updatedEntry.save();

    req.flash('success', "Successfully updated entry details");
    res.redirect(`/entries/${id}`);
}


module.exports.renderEdit = async(req,res)=>{
    const entry = await this.getEntry(req.params.id);
    res.render('entries/edit', {entry})
}

module.exports.showEntry = async(req,res)=>{
    const entry = await this.getEntry(req.params.id);
    res.render('entries/show', {entry})
}
// module.exports.updateEntry = async (entry, eID) => {
//     const updatedEntry = await Entry.findByIdAndUpdate(eID,{...entry});
//     await updatedEntry.save();
// }

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

// module.exports.deleteEntry = async (eID) => {
//     await Entry.findOneAndDelete({_id:eID});
// }

module.exports.deleteEntry = async (req,res)=>{
    const {id} = req.params;
    const userID = res.locals.currentUser._id;
    await removeEntry(id, userID);
    // await deleteEntry(id);
    await Entry.findOneAndDelete({_id:id});
    req.flash('success', 'Successfully removed book from library');
    res.redirect('/entries');
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