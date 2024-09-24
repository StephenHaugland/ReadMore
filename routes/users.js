const express = require('express');
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const {storeReturnTo} = require('../middleware');
const users = require('../controllers/users')
const router = express.Router();


router.get('/register', catchAsync(async(req,res)=>{
    res.render('users/register')
}))

router.post('/register', catchAsync(async(req,res)=>{
    const {email,username,password} = req.body;
    const user = new User({email,username});
    const registeredUser = await User.register(user,password);
    req.login(registeredUser, err=> {
        if(err) return next(err);
        req.flash('success', "Welcome to ReadMore!");
        res.redirect('/entries');
    })
}))

router.get('/login', catchAsync(async(req,res)=>{
    res.render('users/login');
}))

router.post('/login', storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), catchAsync(async(req,res)=>{
    req.flash('success', 'Welcome Back!');
    const redirectUrl = res.locals.returnTo || '/entries';
    // delete req.session.returnTo;
    res.redirect(redirectUrl);
}))

router.get('/logout', catchAsync(async (req,res)=>{
    req.logout(function (err) {
        if(err){
            return next(err);
        }
    });
    req.flash('success', 'Goodbye!');
    res.redirect('/');
}))


module.exports = router;
