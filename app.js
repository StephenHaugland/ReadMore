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
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const {deleteOrphanBook} = require('./controllers/books.js')

const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const books = require('./routes/books');
const entries = require('./routes/entries');
const users = require('./routes/users');

const MongoDBStore = require('connect-mongo')(session);


const dbUrl = process.env.DB_URL;
// const dbUrl = 'mongodb://localhost:27017/read-more'
// console.log(dbUrl);
mongoose.connect(dbUrl);


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
app.use(helmet());
// app.use(express.json());

// const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const secret = process.env.SECRET;


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
    proxy: true,
    cookie: {
        httpOnly: true,
        secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            manifestSrc: ["'self'"],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "http://books.google.com/books/content",
                "https://external-content.duckduckgo.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


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
            await deleteOrphanBook(req.session.orphanBookID);
            delete req.session.orphanBookID;
        }
    }
    next();
})

app.use('/',users);
app.use('/books', books);
app.use('/entries', entries); 

app.get('/', (req,res) => {
    if(!req.isAuthenticated()){
        return res.render('home')
    }
    res.redirect('/entries')
})

app.get('/home', (req,res)=>{
    res.render('home')
})




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
