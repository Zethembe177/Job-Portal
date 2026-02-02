const mongoose = require('mongoose');
const Listing = require('./models/Listings');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

async function clearListings() {
  try {
    await Listing.deleteMany({});
    console.log('All listings deleted!');
    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    mongoose.disconnect();
  }
}

clearListings();
