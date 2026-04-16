const User = require('../models/user');
const passportLocalMongoose = require('passport-local-mongoose')
const ExpressError = require('../utilities/ExpressError');
const {checkPasswordLength} = require('../utilities/middleware');
module.exports.login = async (req, res) => {
    const { username } = req.body;
    const redirectURL = res.locals.returnTo;
    req.flash('success', `Welcome back ${username}`)
    delete req.session.returnTo;
    if(redirectURL){
    res.redirect(redirectURL)
    }else{res.redirect('/campgrounds')}

}
module.exports.renderLogin = (req, res) => {
    res.render('login')
}
module.exports.renderSignup = (req, res) => {
    
    res.render('signup');
}


module.exports.Signup = async (req, res, next) => {
    try {
        const { username, password, email } = req.body;
      
     
        const newUser = new User({ email: email, username: username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, function (err) {
            if (err) { return next(new ExpressError(err.message, 402)); }
            
        });
        req.flash('success', 'Welcome to Yelp camp')
        return res.redirect('/campgrounds')
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/signup', 302);
    }



}

module.exports.Signout =  (req, res) => {

    try {
        req.logout(function (err) {
            if (err) {
                next(err(err.message, 402));
            } else {
                req.flash('success', 'Your signed out, bye!')
                res.redirect(302, '/campgrounds')
            }

        })
    } catch { err }

}