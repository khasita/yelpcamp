const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const review = require("../models/review");
const { reviewSchema } = require("../schemas.js");
const ExpressError = require("../utils/ExpressError");

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.post(
  "/",
  validateReview,
  catchAsync(async (req, res) => {
    const rev = await Campground.findById(req.params.id);
    const newReview = new review(req.body.review);
    rev.reviews.push(newReview);
    await newReview.save();
    await rev.save();
    req.flash("success", "Your review is added");
    res.redirect(`/campgrounds/${rev._id}`);
  })
);

router.delete("/:reviewId", async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await review.findByIdAndDelete(reviewId);
  req.flash("success", "Deleted your review");
  res.redirect(`/campgrounds/${id}`);
});

module.exports = router;
