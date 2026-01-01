const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const review = require("../models/review");
const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware");

router.post(
  "/",
  isLoggedIn,
  validateReview,
  catchAsync(async (req, res) => {
    const rev = await Campground.findById(req.params.id);
    const newReview = new review(req.body.review);
    newReview.author = req.user._id;
    rev.reviews.push(newReview);
    await newReview.save();
    await rev.save();
    req.flash("success", "Your review is added");
    res.redirect(`/campgrounds/${rev._id}`);
  })
);

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await review.findByIdAndDelete(reviewId);
  req.flash("success", "Deleted your review");
  res.redirect(`/campgrounds/${id}`);
});

module.exports = router;
