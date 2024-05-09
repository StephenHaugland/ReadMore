const mongoose = require('mongoose');
const books = require('./books');
const Book = require('../models/book');

mongoose.connect('mongodb://localhost:27017/reading-list');

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const seedDB = async () => {
    await Book.deleteMany({});
    for (let i = 0; i < books.length; i++) {
        const book = new Book({
          //YOUR USER ID
            // user: '661ed50ba461e3931fc98f28',
            title: books[i].title,
            author: books[i].author,
            genre: books[i].genre,
            list: books[i].list
            
        })
        await book.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})