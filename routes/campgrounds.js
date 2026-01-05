const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const campgrounds = require("../controllers/campgrounds");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

// const uploadMiddleware = upload.array("image"); // Reference the middleware function

// router.route("/").post(
//   (req, res, next) => {
//     uploadMiddleware(req, res, function (err) {
//       if (err) {
//         // THIS WILL CATCH THE ERROR IF MULTER/CLOUDINARY FAILS
//         console.error("--- UPLOAD ERROR CAUGHT ---");
//         console.error(err);
//         return res
//           .status(500)
//           .send("Upload Failed. Check console for details.");
//       }
//       next(); // Proceed only if upload succeeds
//     });
//   },
//   (req, res) => {
//     console.log(req.body, req.files); // SHOULD PRINT NOW
//     res.send("It worked!");
//   }
// );

router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
