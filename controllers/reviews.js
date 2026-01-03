const Campground = require("../models/campground");
const review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const rev = await Campground.findById(req.params.id);
  const newReview = new review(req.body.review);
  newReview.author = req.user._id;
  rev.reviews.push(newReview);
  await newReview.save();
  await rev.save();
  req.flash("success", "Your review is added");
  res.redirect(`/campgrounds/${rev._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await review.findByIdAndDelete(reviewId);
  res.redirect(`/campgrounds/${id}`);
};
