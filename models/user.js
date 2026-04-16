const mongoose = require('mongoose');
const passport = require('passport');
const schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new schema({
    image: {type: String, default: '/user.png'},
    
    email: {type:String,
        required:true,
        unique:true


    },

    campgroundIds:[{type: schema.Types.ObjectId, ref: 'campground'}],
    reviewIds:[{type: schema.Types.ObjectId, ref: 'review'}]
}) 
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', userSchema);
module.exports = User;