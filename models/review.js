const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  body: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  campground: { type: Schema.Types.ObjectId, ref: 'Campground' }

})

module.exports = mongoose.model('Review', reviewSchema);
