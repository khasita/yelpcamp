const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

mongoose.connect("mongodb://localhost:27017/yelp-camp-maptiler");
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      // author: "6955d99240f7eed14b91bc89",
      author: "695c7aca447cbca0d1ea72c4",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      price,
      images: [
        {
          url: "https://res.cloudinary.com/dqgkbdn3f/image/upload/v1767570264/YelpCamp/v9htjecc2xr4ldcggkea.jpg",
          filename: "YelpCamp/v9htjecc2xr4ldcggkea",
        },
        {
          url: "https://res.cloudinary.com/dqgkbdn3f/image/upload/v1767570264/YelpCamp/romfqnwm5dwkoq15bzdm.jpg",
          filename: "YelpCamp/romfqnwm5dwkoq15bzdm",
        },
        {
          url: "https://res.cloudinary.com/dqgkbdn3f/image/upload/v1767570265/YelpCamp/eu4spgznw7ar61pcfnz2.jpg",
          filename: "YelpCamp/eu4spgznw7ar61pcfnz2",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
