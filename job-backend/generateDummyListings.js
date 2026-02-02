const mongoose = require("mongoose");
const Listing = require("./models/Listings");
const User = require("./models/Users");
const { geocodeAddress } = require("./utils/geocode");
const cloudinary = require("./config/cloudinary"); // new
require("dotenv").config();
const path = require("path");
const MONGO_URI = process.env.MONGO_URI;

const categories = ["Software Development", "Marketing", "Finance", "Design", "Sales", "HR"];
const titles = ["Junior Developer", "Senior Designer", "Marketing Manager", "Sales Executive", "Finance Analyst"];
const addresses = [
  "Cape Town, South Africa",
  "Johannesburg, South Africa",
  "Durban, South Africa",
  "Pretoria, South Africa",
  "Port Elizabeth, South Africa"
];

// Example local image paths (put these in a folder like /dummyImages)

const imagePaths = [
  path.join(__dirname, "dummyImages", "dev.jpg"),
  path.join(__dirname, "dummyImages", "wev.jpg"),
  path.join(__dirname, "dummyImages", "bev.jpg"),
  path.join(__dirname, "dummyImages", "lev.jpg"),
  path.join(__dirname, "dummyImages", "kev.jpg"),
  path.join(__dirname, "dummyImages", "tev.jpg"),
];

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

async function generateListings(count = 20) {
  try {
    const employers = await User.find({ role: "employer" });
    if (!employers.length) return console.log("No employer users found. Create some first!");

    for (let i = 0; i < count; i++) {
      const title = titles[Math.floor(Math.random() * titles.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const address = addresses[Math.floor(Math.random() * addresses.length)];

      const salaryMin = Math.floor(Math.random() * 20000) + 5000;
      const salaryMax = salaryMin + Math.floor(Math.random() * 50000) + 5000;

      const location = await geocodeAddress(address);
      if (!location) continue;

      const owner = employers[Math.floor(Math.random() * employers.length)]._id;

      // Pick a random image from local folder
      const imagePath = imagePaths[Math.floor(Math.random() * imagePaths.length)];

      // Upload image to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(imagePath, {
        folder: "job-listings",
        public_id: `${title.replace(/\s/g, "_")}_${i}`,
      });

      const newListing = new Listing({
        title,
        category,
        salary: { min: salaryMin, max: salaryMax },
        address,
        location: {
          type: "Point",
          coordinates: [location.lng, location.lat]
        },
        owner,
       images: [
  {
    url: uploadResult.secure_url,
    public_id: uploadResult.public_id,
  }
],
 // save Cloudinary URL
      });

      await newListing.save();
      console.log(`Created listing: ${title} in ${category} with image`);
    }

    console.log("Dummy listings generation complete!");
    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    mongoose.disconnect();
  }
}

// Run the script
generateListings(20);
