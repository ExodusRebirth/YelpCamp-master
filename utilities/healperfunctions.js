const { joiCampgroundSchema, joiReviewSchema } = require('../utilities/schemas.js');
const campground = require('../models/campground');
const ExpressError = require('./ExpressError');
const mongoose = require('mongoose');
/**
 * Helper function to delete all campgrounds from the database
 * Used for testing purposes
 */

const deleteDatabase = async () => {
    try {
        await campground.deleteMany({});
        console.log('Database cleared!');
    } catch (err) {
        console.error('Error clearing database:', err);
    }
};

/**
 * Middleware to validate campground data using Joi schema
 */
const validateCampground = (req, res, next) => {
    const { err } = joiCampgroundSchema.validate(req.body);
    if (err) {
        const msg = err.details.map(el => el.message).join(',')
        next(new ExpressError(msg, 400));
    } else {
        next();
    }
}
const validateReview = (req, res, next) => {
    const { err } = joiReviewSchema.validate(req.body);
    if (err) {
        const msg = err.details.map(el => el.message).join(',')
        next(new ExpressError(msg, 400));
    } else {
        next();
    }
}

//Authorization Middleware (future use / not implemented yet)
const validateIsAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return next(new ExpressError('You do not have permission to do that!', 403));
    }
    next();
}

const validateIsAuthor = (req, res, next) => {
    const { id } = req.params;
    const userCampIds = req.user.campgroundIds.map(campId => campId.toString());
    if (userCampIds.includes(id)){user.isAuthor = true;}
    const campground = campground.findById(id);
    if (!campground) {
        return next(new ExpressError('Campground not found', 404));
    }
    next();
}

// helper fucntions


const TryCatchWrap = function (func) {
    return function (req, res, next) {
        func(req, res, next).catch(err => next(err))
    }
}

//not implemented yet
const checkPasswordLength = (password) => {
    const minLength = 7;
    const lengthCheck = password.length >= minLength;
    const messageElement = document.getElementById("lengthMessage");
    if (lengthCheck) {
        messageElement.innerHTML = "Password is long enough.";
        messageElement.style.color = "green";
    } else {
        messageElement.innerHTML = "Password must be at least " + minLength + " characters.";
        messageElement.style.color = "red";
    }
}

module.exports = { TryCatchWrap, deleteDatabase, validateCampground, validateReview, validateIsAdmin, validateIsAuthor, checkPasswordLength };