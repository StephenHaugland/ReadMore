const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const ImageSchema = new Schema ({
//     url: String,
//     filename:String
// });


const BookSchema = new Schema({
    isbn: String,
    coverUrl: String,
    title: String,
    author: String,
    genre: String,
    fiction: {
        type: String,
        enum: ['Fiction', 'Non-Fiction']
    }
});

module.exports = mongoose.model('Book', BookSchema);