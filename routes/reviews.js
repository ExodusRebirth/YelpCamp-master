const reviewControllers = require('../controllers/reviews')
const review = require('../models/review');
const { isLoggedIn, isReviewAuthor, storeReturnTo, TryCatchWrap, validateReview, validateReqBody} = require('../utilities/middleware');

const express = require('express')
const router = express.Router({ mergeParams: true });

//Create new review - handles POST request to add a review to a campground
router.post('/:id/reviews', isLoggedIn, validateReview, TryCatchWrap(reviewControllers.postReview))

//not working yet Put Request for editting review
router.put('/:id/reviews/:reviewId', isLoggedIn, TryCatchWrap(reviewControllers.PostEditReview));

//Delete route for reviews
router.delete('/:id/reviews/:reviewId', isLoggedIn, isReviewAuthor, TryCatchWrap(reviewControllers.DeleteReview));

module.exports = router;