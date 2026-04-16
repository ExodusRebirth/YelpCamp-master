//models
const User = require('../models/user');
const {renderLogin, login, Signup, renderSignup, Signout} = require('../controllers/accounts');

//passport
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose')

//utilities
const ExpressError = require('../utilities/ExpressError');
const {TryCatchWrap, storeReturnTo } = require('../utilities/middleware');
//express and router
const express = require('express');
const router = express.Router({ mergeParams: true });



router.route('/login')
.post(storeReturnTo, passport.authenticate('local', { failureFlash: { type: 'error', messsage: 'Username or password is incorrect!' }, failureRedirect: '/login' }), TryCatchWrap(login))
.get(renderLogin)




router.route('/signup').get(renderSignup).post(TryCatchWrap(Signup))

router.route('/signout').get(Signout)


module.exports = router;
