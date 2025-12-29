const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");

const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));

app.engine("ejs", ejsMate);

mongoose.connect("mongodb://localhost:27017/yelp-camp");
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sessionConfig = {
  secret: "thisismysecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));

app.use(flash()); // Flash messages are stored in req.session
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);
app.use(express.static(path.join(__dirname, "public")));

app.all(/(.*)/, (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});

// Middleware are just functions. Each middleware has access to the requires and response objects.
// Middleware can end the HTTP request by sending back a response with methods like res.send().
// OR middleware can be chained together, one after another by calling nextTick().
// Error handling middleware are defined after all other app.use() and routes calls.
// Async function returns a promise. If the promise is rejected, Express will catch the error and pass it to the error handling middleware.
// In an async function, throw means the async function returns a rejected promise.
// The wrapper calls your async route and attaches a .catch(). With wrapAsync, all async errors become next(err) automatically.
// Cookies are little bits of information that are stored in a users browser when browsing a particular website.
// Once a cookie is set, a users browser will send the cookie on every subsequent request to the site.
// HTTP is stateless. Cookies help to maintain stateful information for the stateless HTTP protocol.
// Cookies allow use to make HTTP stateful.
// Sessions: Its not pratical or secure to store a lot of data client-side using cookies. This is where sessions come in.
// Sessions are a server-side store that we use to make HTTP stateful. Instead of storing data using cookies, we store the data on the server-side and then send the browser a cookie that can be used to retrieve the data.
