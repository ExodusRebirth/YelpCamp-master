const Review = require('../models/review')
const Campground = require('../models/campground');

module.exports.postReview = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) { throw new ExpressError; }

    const newReview = new Review(req.body.review);

    newReview.campground = campground._id;
    await newReview.save();

    newReview.author = req.user._id;
    await newReview.save();


    req.flash('success', 'Successfully added a new review!');
    campground.reviews.push(newReview);
    await campground.save();



    res.redirect(`/campgrounds/${id}`)

}

module.exports.PostEditReview = async (req, res) => {

    await review.findByIdAndUpdate(req.params.reviewId, { body: req.params.reviewId.body, review: req.params.reviewId.review });
    req.flash('Info', 'Successfully updated review');
    res.redirect(`/campgrounds/${req.params.id}`);
}

module.exports.DeleteReview = async (req, res) => {
    await Campground.findByIdAndUpdate(req.params.id, { $pull: { reviews: req.params.reviewId } });
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('deleted', 'Successfully deleted review');
    res.redirect(`/campgrounds/${req.params.id}`);
}