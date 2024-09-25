const User = require('../models/user');


module.exports.renderRegister = (req,res)=>{
    res.render('users/register');
}

module.exports.register = async(req,res)=>{
    try {
        const {email,username,password} = req.body;
        const user = new User({email,username});
        const registeredUser = await User.register(user,password);
        req.login(registeredUser, err=> {
            if(err) return next(err);
            req.flash('success', "Welcome to ReadMore!");
            res.redirect('/entries');
        })
    } catch(e){
        req.flash('error', e.message);
        res.redirect('register');
    }
}

module.exports.renderLogin = (req,res)=>{
    res.render('users/login');
}

module.exports.login = (req,res) =>{
    req.flash('success', 'Welcome Back!');
    const redirectUrl = res.locals.returnTo || '/entries';
    res.redirect(redirectUrl);
}

module.exports.logout = (req,res)=>{
    req.logout(function (err) {
        if(err){
            return next(err);
        }
    });
    req.flash('success', 'Goodbye!');
    res.redirect('/');
}

module.exports.addEntry = async (entry,uID) => {
    const user = await User.findOneAndUpdate({_id:uID}, {
        $push: {entries: entry._id}
    });
    await user.save();
}

module.exports.removeEntry = async (eID, uID) => {
    await User.findByIdAndUpdate(uID, {$pull: {entries: eID}});
}


module.exports.getFilteredEntries = (filter, entries) => {
    // filter = filter.toLowerCase();

    // console.log(entries);
    // const lowercaseGenre = allEntries
    const filteredEntries = [];
    for (let i =0; i<entries.length; i++){
        if (entries[i].book.genre.includes(filter)){
            filteredEntries.push(entries[i]);
        }
        console.log(entries[i].book.genre)
    }


    
    // console.log(filteredEntries);
    return filteredEntries;
}

module.exports.getAllEntries = async (uID) =>{
    const result = await User.findOne({_id:uID})
    .populate({
        path: 'entries',
        populate: {
            path: 'book'
        }
    })
    .select('entries');
    // console.log(result);
    return result.entries;
}