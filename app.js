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
const {storeReturnTo, isLoggedIn, matchQueryString} = require('./middleware');
// const {getBooks, createBook} = require('./database.js');
const {createNewBook, addBookToShelf, getUserLibrary, getBook, updateBook, deleteBook, getAllBooks} = require('./controllers/books.js')
const {createNewEntry, getEntry, updateEntry, deleteEntry, getEntryByBook, sortByShelf} = require('./controllers/entries');
const {addEntry, getAllEntries, removeEntry, getFilteredEntries} = require('./controllers/users');
const {capitalizeString} = require('./utils/capitalizeString.js');


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
    if(!req.isAuthenticated()){
        return res.render('home')
    }
    res.redirect('/entries')
})

app.get('/home', (req,res)=>{
    res.render('home')
})

app.get('/search', (req,res)=>{
    let populate=false ;
    res.render('search', {populate});
})

app.post('/search', async(req,res)=>{
    // console.log(req.body);
    try {
        const results = await searchByTerm(req.body.q);
        populate = true;
        console.log(results);
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
app.get('/books', async (req,res)=>{
    // NEW MONGO INDEX
    // const userID = res.locals.currentUser._id;
    const books = await getAllBooks();


    // const shelves = await getUserLibrary(userID);
    // console.log(shelves);
    // const {read} = shelves;
    // console.log(read)
    
    // LEGACY SQL, DELETE LATER
    // query sql server for books
    // const books = await getBooks();
    // console.log(books);
    res.render('books/index', {books});
})

app.get('/books/new', (req,res) => {
    res.render('books/new')
})

// retreive and show 1 book from db
app.get('/books/:id', async(req,res)=>{
    const book = await getBook(req.params.id);
    res.render('books/show', {book})
})

// add 1 new book
app.post('/books', async(req,res)=>{
    //NEW MONGO
    // addBookToShelf(book,r)
    const {book} = req.body;
    // const userID = res.locals.currentUser._id;
    const newBook = await createNewBook(book);
    // await addBookToShelf(newBook, userID, shelf);
    
    res.redirect(`/books/${newBook._id}`);
})

// route to show book edit page
app.get('/books/:id/edit', async(req,res)=>{
    
    const book = await getBook(req.params.id);
    res.render('books/edit', {book})
})

// post route to update book
app.put('/books/:id', async(req,res)=>{
    const {id} = req.params;
    const {book} = req.body;
    const updatedBook = await updateBook(book,id);
    const updatedEntry = await getEntryByBook(id);
    const redirectUrl = `/entries/${updatedEntry._id}` || '/books/${id}';
    // delete req.session.returnTo;
    res.redirect(redirectUrl)
})

// delete route to remove 1 book by id
app.delete('/books/:id', async (req,res)=>{
    const {id} = req.params;
    await deleteBook(id);
    req.flash('success', 'Successfully deleted book');

    res.redirect('/books');
})

//////////////////////////////////////////////////////////////////
// entry routes
//////////////////////////////////////////////////////////////////


// index page for all entries IF NO SHELF SPECIFIED
app.get('/entries',matchQueryString, async (req,res)=>{
    let filter = "";
    const userID = res.locals.currentUser._id;
    let filteredEntries = '';
    const entries = await getAllEntries(userID);
    let shelfSortedEntries = '';
    if (req.query.genre){
        filter = capitalizeString(req.query.genre);
        console.log(`filter parameter: ${filter}`);
        try{
            filteredEntries = await getFilteredEntries(filter, entries);
            // console.log(filteredEntries);
            shelfSortedEntries = await sortByShelf(filteredEntries);
        }
        catch(e){
            console.log(e)
        }
    } else {
        shelfSortedEntries = await sortByShelf(entries);
        
    }
    // console.log(shelfSortedEntries);
    console.log(`filteredentries: ${filteredEntries}`);
    res.render('entries/index', {shelfSortedEntries, filteredEntries, filter});
})

// entries route IF SHELF PARAM SPECIFIED
app.get('/entries', async(req,res)=>{
    let shelf = req.query.shelf;
    console.log(`shelf: ${shelf}`)
    let filter = "";
    const userID = res.locals.currentUser._id;
    let filteredEntries = '';
    const entries = await getAllEntries(userID);
    let shelfSortedEntries = await sortByShelf(entries);
    if (req.query.genre){
        filter = capitalizeString(req.query.genre);
        console.log(`filter parameter: ${filter}`);
        try{
            // console.log( shelfSortedEntries[shelf])
            filteredEntries = await getFilteredEntries(filter, shelfSortedEntries[shelf]);
            console.log(filteredEntries);
            

        }
        catch(e){
            console.log(e)
        }
    }
    res.render(`entries/shelf`, {shelfSortedEntries, filteredEntries, filter, shelf})
})

// render new entry form page
app.get('/entries/new', (req,res) => {
    res.render('entries/new')
})


// add 1 new entry to user
app.post('/entries', async(req,res)=>{
    // create new entry using data supplied from form
    const {entry} = req.body;
    // console.log(`entry from form: ${{entry}}`);
    const newEntry = await createNewEntry(entry);
    // console.log(`entry created from db: ${newEntry}`)

    // add newly created entry to user profile
    const userID = res.locals.currentUser._id;
    await addEntry(newEntry, userID);

    res.redirect(`/entries/${newEntry._id}`);
})



// route to show entry edit page
app.get('/entries/:id/edit', async(req,res)=>{
    const entry = await getEntry(req.params.id);
    res.render('entries/edit', {entry})
})

// post route to update book
app.put('/entries/:id', async(req,res)=>{
    const {id} = req.params;
    const {entry} = req.body;
    await updateEntry(entry,id);
    res.redirect(`/entries/${id}`);
})

// retreive and show 1 entry
app.get('/entries/:id', async(req,res)=>{
    const entry = await getEntry(req.params.id);
    console.log(`page count is : ${entry.book.pageCount}`)
    // const {book, shelf, notes} = entry;
    // console.log(`book cover img: ${entry.book.coverUrl}`)
    res.render('entries/show', {entry})
})

// delete route to remove 1 entry by id
app.delete('/entries/:id', async (req,res)=>{
    const {id} = req.params;
    const userID = res.locals.currentUser._id;

    await removeEntry(id, userID);

    await deleteEntry(id);
    req.flash('success', 'Successfully deleted book');

    res.redirect('/entries');
})



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