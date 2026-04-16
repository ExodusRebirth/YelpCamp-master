
const Campground = require("../models/campground");
const Review = require('../models/review')
const { campgroundSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./ExpressError');

const storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
}
const isLoggedIn = (req, res, next) => {

  if (!req.isAuthenticated()) {
    //store original URL request before moved
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'Sorry, You must be logged in to do that')
    return res.redirect('/login')
  }
  next();
}

const isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash('error', 'Your not Authorized to change that.')
    return res.redirect(`/campgrounds/${campground._id}`)
  }
  next();
}

const isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'Your not Authorized to change that.')
    return res.redirect(`/campgrounds/${id}`)
  }
  next();
}





/**
 * Helper function to delete all campgrounds from the database
 * Used for testing purposes
 */

const deleteDatabase = async () => {
  try {
    await Campground.deleteMany({});
    console.log('Database cleared!');
  } catch (err) {
    console.error('Error clearing database:', err);
  }
};

/** 
 * Middleware to validate campground data using Joi schema
 */
const validateCampground = (req, res, next) => {
  console.log(req.body);
  const { error } = campgroundSchema.validate(req.body);

  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400)
  } else {
    next();
  }
}

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400)
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
  if (userCampIds.includes(id)) { user.isAuthor = true; }
  const campground = Campground.findById(id);
  if (!campground) {
    return next(new ExpressError('Campground not found', 404));
  }
  next();
}
// helper functions

const TryCatchWrap = function (func) {
  return function (req, res, next) {
    func(req, res, next).catch(err => next(err))
  }
}

const validateReqBody = (req, res, next) => {
  if (req.body) {
    console.log(`req.body: ${JSON.stringify(req.body)}`)
    next();
  }
  next();
}




module.exports = { isLoggedIn, storeReturnTo, isAuthor, isReviewAuthor, TryCatchWrap, deleteDatabase, validateCampground, validateReview, validateIsAdmin, validateIsAuthor, validateReqBody };