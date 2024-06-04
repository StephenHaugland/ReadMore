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
    subtitle: String,
    author: [{type: String}],
    genre: [{type: String}]
});

module.exports = mongoose.model('Book', BookSchema);