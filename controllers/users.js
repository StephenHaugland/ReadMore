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