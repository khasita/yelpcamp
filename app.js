const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const methodOverride = require("method-override");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");

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

const verifyPassword = (req, res, next) => {
  const { password } = req.query;
  if (password === "chicken") {
    next();
  }
  throw new Error("Password required!!!");
};

app.get("/campgrounds", verifyPassword, async (req, res) => {
  const camp = await Campground.find({});
  res.render("campgrounds/index", { camp });
});

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.post("/campgrounds", async (req, res) => {
  const newcamp = new Campground(req.body.campground);
  await newcamp.save();
  res.redirect(`/campgrounds/${newcamp._id}`);
});

app.get("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render("campgrounds/show", { campground });
});

app.get("/campgrounds/:id/edit", async (req, res) => {
  const { id } = req.params;
  const editcamp = await Campground.findById(id);
  res.render("campgrounds/edit", { editcamp });
});

app.put("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  res.redirect(`/campgrounds/${id}`);
});

app.delete("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
});

app.use((err, req, res, next) => {
  res.status(401).send(err.message);
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});

// Middleware are just functions. Each middleware has access to the requires and response objects.
// Middleware can end the HTTP request by sending back a response with methods like res.send().
// OR middleware can be chained together, one after another by calling nextTick().
// Error handling middleware are defined after all other app.use() and routes calls.
