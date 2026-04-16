const mongoose = require("mongoose");
const Review = require("./review");
const User = require("./user");
const schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } };

const ImageSchema = new schema({
  url: { type: String, default: `public/newCampgrondImage.png` },
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w-100");
});

const campgroundSchema = new schema(
  {
    sitename: String,
    price: Number,
    description: String,
    city: String,
    state: String,

    images: [ImageSchema],

    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    reviews: [
      {
        type: schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    author: {
      type: schema.Types.ObjectId,
      ref: "User",
    },
  },
  opts,
);
//virtuals for properties in Mapbox

campgroundSchema.virtual("properties.sitename").get(function () {
  return this.sitename;
});
campgroundSchema.virtual("properties.image").get(function () {
  return this.images[0].url;
});
campgroundSchema.virtual("properties.author").get(function () {
  return this.author;
});
campgroundSchema.virtual("properties.url").get(function () {
  return this._id;
});

campgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
});

module.exports = mongoose.model("Campground", campgroundSchema);
