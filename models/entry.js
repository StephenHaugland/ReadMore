const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user')



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
    notes: String    
});

// EntrySchema.pre('findOneAndDelete', async function(doc) {
//     if(doc) {
//         await User.
//     }
// })

module.exports = mongoose.model('Entry', EntrySchema);