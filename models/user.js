const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const Book = require('./book');


const UserSchema = new Schema({
    email: {
        type: String, 
        required: true,
        unique: true
    },
    entries: [{type: Schema.Types.ObjectId, ref:'Entry'}]
    // shelves: {
    //     reading: [{type: Schema.Types.ObjectId, ref:'Book'}],
    //     wantToRead: [{type: Schema.Types.ObjectId, ref:'Book'}],
    //     read: [{type: Schema.Types.ObjectId, ref:'Book'}]
    // }
});
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema);