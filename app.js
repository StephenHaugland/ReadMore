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
const {searchByTerm, getVolumeData, getSingleVolumeData} = require('./bookapi.js')
const {storeReturnTo, isLoggedIn, matchQueryString, isTemporaryBook,isEntryOwner} = require('./middleware');
// const {getBooks, createBook} = require('./database.js');
const {createNewBook, addBookToShelf, getUserLibrary, getBook, updateBook, deleteBook, getAllBooks} = require('./controllers/books.js')
const {createNewEntry, getEntry, updateEntry, deleteEntry, getEntryByBook, sortByShelf} = require('./controllers/entries');
const {addEntry, getAllEntries, removeEntry, getFilteredEntries} = require('./controllers/users');
const {capitalizeString} = require('./utils/capitalizeString.js');
const _ = require('underscore');


const mongoSanitize = require('express-mongo-sanitize');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const Book = require('./models/book');

const books = require('./routes/books');
const entries = require('./routes/entries');

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

app.use(async(req,res,next) =>{
    // console.log(req.session);
    // console.log(res.locals)
    // delete req.session.returnTo;
    res.locals.currentUser = req.user;
    // console.log(req.user);
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');

    if (req.path == '/entries' && req.method == 'POST'){
        // console.log('book was added to entry, remove orphan status');
        delete req.session.orphanBookID;
    }else {
        if (req.session.orphanBookID) {
            // console.log(`deleted book: ${req.session.orphanBookID}`);
            await deleteBook(req.session.orphanBookID);
            delete req.session.orphanBookID;
        }
    }
    next();
})




app.get('/', (req,res) => {
    if(!req.isAuthenticated()){
        return res.render('home')
    }
    res.redirect('/entries')
})

app.get('/home', (req,res)=>{
    res.render('home')
})

app.get('/search', isLoggedIn,(req,res)=>{
    let populate=false ;
    res.render('search', {populate});
})

app.post('/search', storeReturnTo, isLoggedIn, async(req,res)=>{
    req.session.returnTo = req.originalUrl
    // console.log(`sessionReturnTo: ${req.session.returnTo}`);
    
    // console.log(req.body);
    // delete req.session.returnTo;
    try {
        const results = await searchByTerm(req.body.q);
        populate = true;
        // console.log(results);
        res.render('search', {results, populate});
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('home')
    }

    // const vData = await getVolumeData(results);
    // console.log(`data from array: ${vData}`);
    // const sData = await getSingleVolumeData(results.items[0]);
    // console.log(`single data:${sData}`);
})

// app.get('/search/result', (req,res)=>{
//     res.render('search/result', {books});
// })

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
            req.flash('success', "Welcome to ReadMore!");
            res.redirect('/entries');
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
    const redirectUrl = res.locals.returnTo || '/entries';
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
    res.redirect('/');
})


////////////////////////////////////////////////////////////////////////
// Book Routes
////////////////////////////////////////////////////////////////////////

// retrieve and show all books in the db
app.get('/explore', isLoggedIn, async (req,res)=>{
    // NEW MONGO INDEX
    // const userID = res.locals.currentUser._id;
    const books = await getAllBooks();
    // pick n random books from all books in DB
    let randCollection = _.sample(books,25);
    // console.log(randCollection)

    // const shelves = await getUserLibrary(userID);
    // console.log(shelves);
    // const {read} = shelves;
    // console.log(read)
    
    // LEGACY SQL, DELETE LATER
    // query sql server for books
    // const books = await getBooks();
    // console.log(books);
    res.render('books/explore', {randCollection});
})


app.use('/books', books);

//////////////////////////////////////////////////////////////////
// entry routes
//////////////////////////////////////////////////////////////////

app.use('/entries', entries); 



/////////////////////////////////////////////////////////////////////


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