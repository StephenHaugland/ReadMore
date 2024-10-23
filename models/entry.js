const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');
const { any } = require('joi');



const EntrySchema = new Schema({
    book: {
        type: Schema.Types.ObjectId,
        ref:'Book'
    },
    shelf: {
        type: String,
        enum: ['Read','Want to Read','Reading'],
        required:true
    },
    quillNotes: {
        type: String
    }
});

// EntrySchema.pre('findOneAndDelete', async function(doc) {
//     if(doc) {
//         await User.
//     }
// })

module.exports = mongoose.model('Entry', EntrySchema);