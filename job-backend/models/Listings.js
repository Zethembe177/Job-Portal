const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },

  // Salary range
  salary: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },

  // Plain text address
  address: { type: String, required: true },

  // GeoJSON location (longitude, latitude)
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
      default: [0, 0], // temporary placeholder, replace with real geocode
    }
  },

  // Reference to the employer
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Optional images array
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    }
  ]
}, { timestamps: true });

// Geospatial index
listingSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Listing", listingSchema);
