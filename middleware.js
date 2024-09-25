const {bookSchema,entrySchema} = require('./schemas.js');
const ExpressError = require('./utils/ExpressError.js');
const Book = require('./models/book');
const { getBook } = require('./controllers/books.js');

module.exports.isLoggedIn = (req,res,next) =>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!')
        return res.redirect('/login')
    }
    next();
}


module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.isValidBook = async(req,res,next)=>{
    const book = await getBook(req.params.id);
    if (book == null){
        req.flash('error', 'Book not found!');
        return res.redirect('/entries');
    }
    next();
}

module.exports.isTemporaryBook = (req,res,next) => {
    req.session.returnTo = req.originalUrl;
    // console.log(req.session);
    next();
}

module.exports.isEntryOwner = (req,res,next) => {
        if (!req.user.entries.includes(req.params.id)){
        req.flash('error', 'Entry Not Found')
        return res.redirect('/entries');
    }
    next();
}

// module.exports.deleteOrphanBook = async(req,res,next) => {
//     if (req.session.orphanBookID) {
//         console.log(`delete book: ${req.session.orphanBookID}`);
//         // await deleteBook(req.session.orphanBookID);
//         delete req.session.orphanBookID;
//     }
// }

module.exports.validateBook = (req,res,next) => {
    const {error} = bookSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.validateEntry = (req,res,next) => {
    const {error} = entrySchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


// module.exports.isAuthor = async (req,res,next) =>{
//     const {id} = req.params;
//     const campground = await Campground.findById(id);
//     if (!campground.author.equals(req.user._id)) {
//         req.flash('error','You do not have permission to do that!');
//         return res.redirect(`/campgrounds/${id}`);
//     }
//     next();
// }

// module.exports.isReviewAuthor = async (req,res,next) =>{
//     const {id, reviewId} = req.params;
//     const review = await Review.findById(reviewId);
//     if (!review.author.equals(req.user._id)) {
//         req.flash('error','You do not have permission to do that!');
//         return res.redirect(`/campgrounds/${id}`);
//     }
//     next();
// }

// module.exports.validateReview = (req,res,next) => {
//     const {error} = reviewSchema.validate(req.body);
//     if (error){
//         const msg = error.details.map(el=>el.message).join(',');
//         throw new ExpressError(msg, 400)
//     } else {
//         next();
//     }
// }

module.exports.matchQueryString = function(req, res, next) {
    return next(req.query.shelf ? 'route' : null);
  };