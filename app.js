const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const Joi = require('joi');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const mysql2 = require('mysql2');

const mongoSanitize = require('express-mongo-sanitize');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');


const Book = require('./models/book');

const MongoDBStore = require('connect-mongo')(session);


const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/reading-list';
mongoose.connect(dbUrl);

// mongoose.connect('mongodb://localhost:27017/reading-list');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
})


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';


const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchafter: 24 * 60 * 60
})

store.on("error", function(e){
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) =>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})




app.get('/', (req,res) => {
    res.render('home')
})

app.get('/search', (req,res)=>{
    res.render('search');
})

// app.post()

app.get('/library', async (req,res)=>{
    const books = await Book.find({});
    res.render('library/index', {books});
})

app.get('/library/new', (req,res) => {
    res.render('library/new')
})

app.get('/library/:id', async(req,res)=>{
    const book = await Book.findById(req.params.id);
    res.render('library/show', {book})
})

app.post('/library', async(req,res)=>{
    const book = new Book(req.body.book);
    await book.save();

    res.redirect(`/library/${book._id}`);
})

app.get('/library/:id/edit', async(req,res)=>{
    const book = await Book.findById(req.params.id)
    res.render('library/edit', {book})
})

app.put('/library/:id', async(req,res)=>{
    const {id} = req.params;
    const book = await Book.findByIdAndUpdate(id,{...req.body.book});
    res.redirect(`/library/${book._id}`);
})

app.delete('/library/:id', async (req,res)=>{
    const {id} = req.params;
    await Book.findByIdAndDelete(id);
    res.redirect('/library');
})

// app.get('/makebook', async(req,res) => {
//     const book = new Book({title:'12 Rules For Life', author: 'Jordan Peterson', genre: 'non-fiction', list: 'read'});
//     await book.save();
//     res.send(book);
// })


app.all('*', (req,res,next)=>{
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if (!err.message) err.message = "Oh no something went wrong."
    res.status(statusCode).render('error', {err});
})

const port = process.env.PORT || 3000;
app.listen(port, ()=> {
    console.log(`Serving on port ${port}`);
})