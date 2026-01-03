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
const User = require("./models/user");
const passport = require("passport"); // pbkdf2-based algorithm for hashing passwords
const Local = require("passport-local");
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

mongoose.connect("mongodb://localhost:27017/yelp-camp");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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

// Setup/Parsers
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("dev"));

// Session

app.use(session(sessionConfig));
app.use(flash());

// Passport Configuration

app.use(passport.initialize());
app.use(passport.session());
passport.use(new Local(User.authenticate()));
passport.serializeUser(User.serializeUser()); // How to store a user in the session
passport.deserializeUser(User.deserializeUser()); // How to get a user from the session

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Routes

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

app.all(/(.*)/, (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// Flash messages are stored in req.session

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
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
// Authentication is the process of verifying who a particular user is. We typically authenticate with a username / password combo, but we can also use security questions, facial recognition, etc.
// Authorization is verifying what a specific user has access to. Generally, we authorize after a user has been authenticated. "Now that we know who you are, here is what you are allowed to do and not allowed to do"
// Rather than storing a password in the database, we run the password through a hashing function first and then store the result in the database.
// Password salts - A salt is a random value added to the password before we hash it. It helps ensure unique hashes and mitigate common attacks.
