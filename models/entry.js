const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const EntrySchema = new Schema({
    book: {
        type: Schema.Types.ObjectId,
        ref:'Book'
    },
    shelf: {
        type: String,
        enum: ['read','wantToRead','Reading'],
        required:true
    },
    notes: String    
});

module.exports = mongoose.model('Entry', EntrySchema);