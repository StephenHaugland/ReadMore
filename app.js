if(process.env.NODE_ENV !== "production") {
    console.log("Not in prod");
    require('dotenv').config();
}

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
const {getBooks, createBook} = require('./database.js');
const {searchByTerm} = require('./bookapi.js')
const {storeReturnTo} = require('./middleware');
const {createNewBook, addBookToShelf, getUserLibrary, getBook, updateBook, deleteBook} = require('./controllers/books.js')

const mongoSanitize = require('express-mongo-sanitize');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');


const Book = require('./models/book');

const MongoDBStore = require('connect-mongo')(session);


const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/read-more';

// console.log(dbUrl);
mongoose.connect('mongodb://localhost:27017/read-more');


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
// app.use(express.json());

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
    const books= {};
    res.render('search', {books});
})

app.post('/search', async(req,res)=>{
    // console.log(req.body);
    const books = await searchByTerm(req.body.q);
    res.redirect('/search');
})

app.get('/register', async(req,res)=>{
    res.render('users/register')
})

app.post('/register', async(req,res)=>{
    try{
        const {email,username,password} = req.body;
        const user = new User({email,username});
        const registeredUser = await User.register(user,password);
        req.login(registeredUser, err=> {
            if(err) return next(err);
            req.flash('success', "Welcome to Yelp Camp!");
            res.redirect('/library');
        })
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('register')
    }
})

app.get('/login', async(req,res)=>{
    res.render('users/login');
})

app.post('/login', storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), async(req,res)=>{
    req.flash('success', 'Welcome Back!');
    const redirectUrl = res.locals.returnTo || '/library';
    // delete req.session.returnTo;
    res.redirect(redirectUrl);

})

app.get('/logout', async (req,res)=>{
    req.logout(function (err) {
        if(err){
            return next(err);
        }
    });
    req.flash('success', 'Goodbye!');
    res.redirect('/library');
})


// retrieve and show all books in the db
app.get('/library', async (req,res)=>{
    // NEW MONGO INDEX
    const userID = res.locals.currentUser._id;

    const shelves = await getUserLibrary(userID);
    // console.log(shelves);
    // const {read} = shelves;
    // console.log(read)

    // LEGACY SQL, DELETE LATER
    // query sql server for books
    // const books = await getBooks();
    // console.log(books);
    res.render('library/index', {shelves});
})

app.get('/library/new', (req,res) => {
    res.render('library/new')
})

// retreive and show 1 book from db
app.get('/library/:id', async(req,res)=>{
    const book = await getBook(req.params.id);
    //LEGACY SQL, DELETE LATER
    // const book = await getBook(req.params.id);
    res.render('library/show', {book})
})

// add 1 new book
app.post('/library', async(req,res)=>{
    //NEW MONGO
    // addBookToShelf(book,r)
    const {book, shelf} = req.body;
    const userID = res.locals.currentUser._id;
    const newBook = await createNewBook(book);
    await addBookToShelf(newBook, userID, shelf);
    

    // SQL LEGACY: DELETE LATER
    // const newb= await createBook(book);

    res.redirect(`/library/${newBook._id}`);
})

// route to show book edit page
app.get('/library/:id/edit', async(req,res)=>{
    const book = await getBook(req.params.id);
    res.render('library/edit', {book})
})

// post route to update book
app.put('/library/:id', async(req,res)=>{
    const {id} = req.params;
    const {book, shelf} = req.body;
    const userID = res.locals.currentUser._id;
    const updatedBook = await updateBook(book,id,userID, shelf)
    res.redirect(`/library/${id}`);
})

// delete route to remove 1 book by id
app.delete('/library/:id', async (req,res)=>{
    const {id} = req.params;
    await deleteBook(id);
    req.flash('success', 'Successfully deleted campground');

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