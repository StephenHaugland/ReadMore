const Book = require('../models/book');
const Entry = require('../models/entry');
const User = require('../models/user');

module.exports.addEntry = async (entry,uID) => {
    const user = await User.findOneAndUpdate({_id:uID}, {
        $push: {entries: entry._id}
    });
    await user.save();
}

module.exports.removeEntry = async (eID, uID) => {
    await User.findByIdAndUpdate(uID, {$pull: {entries: eID}});
}


module.exports.getFilteredEntries = (filter, entries) => {
    // filter = filter.toLowerCase();
    let capitalizeString = (str) => {
        str = str.toLowerCase();
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    filter = capitalizeString(filter);
    console.log(entries);
    // const lowercaseGenre = allEntries
    const filteredEntries = [];
    for (let i =0; i<entries.length; i++){
        if (entries[i].book.genre.includes(filter)){
            filteredEntries.push(entries[i]);
        }
        console.log(entries[i].book.genre)
    }


    
    console.log(filteredEntries);
    return filteredEntries;
}

module.exports.getAllEntries = async (uID) =>{
    const result = await User.findOne({_id:uID})
    .populate({
        path: 'entries',
        populate: {
            path: 'book'
        }
    })
    .select('entries');
    // console.log(result);
    return result.entries;
}