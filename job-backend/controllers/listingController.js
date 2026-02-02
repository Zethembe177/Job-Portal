// ========================
// listingController.js (CommonJS version)
// ========================
const cloudinary = require("../config/cloudinary");
const Listing = require('../models/Listings');
const fetch = require('node-fetch'); // keep only if you actually use it
const { geocodeAddress } = require("../utils/geocode");  
const path = require('path')
const fs = require('fs');

// ========================
// Get all listings with filters (public / candidates)
// ========================
const getAllListings = async (req, res) => {
  try {
    const { search, category, minSalary, maxSalary } = req.query;

    let query = {};

    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = category;

    if (minSalary || maxSalary) {
      query.salary = {};
      if (minSalary) query.salary.$gte = Number(minSalary);
      if (maxSalary) query.salary.$lte = Number(maxSalary);
    }

    const listings = await Listing.find(query).populate('owner', 'name email');
    res.status(200).json(listings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ========================
// Get listings of logged-in employer
// ========================
const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user.id });
    res.status(200).json(listings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ========================
// Get single listing by ID
// ========================
const getSingleListing = async (req, res) => {
  try {
    const listing = await Listing
      .findById(req.params.id)
      .populate('owner', 'name email');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json(listing);
  } catch (err) {
    res.status(400).json({ message: 'Invalid listing ID' });
  }
};

// ========================
// Get listings near a location
// ========================
const getNearbyListings = async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radius) || 10; // km

    // 1️⃣ Validate
    if (!lat || !lng) {
      return res.status(400).json({
        message: "lat and lng query parameters are required",
      });
    }

    // 2️⃣ Convert km → meters
    const radiusInMeters = radius * 1000;

    // 3️⃣ Geospatial query
    const listings = await Listing.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat], // IMPORTANT ORDER
          },
          $maxDistance: radiusInMeters,
        },
      },
    }).limit(50);

    res.status(200).json({
      count: listings.length,
      listings,
    });
  } catch (err) {
    console.error("Nearby search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ========================
// Create a listing (only employer)
// ========================
const createListing = async (req, res) => {
  try {
    const { title, category, salary, address } = req.body;

    // Basic validation
    if (!title || !category || !salary?.min || !salary?.max || !address) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const coords = await geocodeAddress(address);
    if (!coords) return res.status(400).json({ message: "Invalid address" });

    // Prepare the basic listing object
    const listingData = {
      title,
      category,
      salary,
      address,
      owner: req.user.id,
      location: {
        type: "Point",
        coordinates: [coords.lng, coords.lat],
      },
      images: [],
    };

    // Handle Image if it exists
    if (req.file) {
      const absolutePath = path.resolve(req.file.path); // Fixes Windows pathing
      const uploadResult = await cloudinary.uploader.upload(absolutePath, {
        folder: "job-listings",
        public_id: `${title.replace(/\s/g, "_")}_${Date.now()}`,
      });

      listingData.images = [{ url: uploadResult.secure_url, public_id: uploadResult.public_id }];

      // Cleanup: delete local file after Cloudinary upload
      fs.unlink(absolutePath, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
    }

    const newListing = new Listing(listingData);
    await newListing.save();
    res.status(201).json(newListing);

  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// ========================
// Update a listing
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, category, address } = req.body;

    if (title) listing.title = title;
    if (category) listing.category = category;

    // Salary handling from FormData strings
    let salary = {};
    if (req.body["salary[min]"]) salary.min = Number(req.body["salary[min]"]);
    if (req.body["salary[max]"]) salary.max = Number(req.body["salary[max]"]);
    if (salary.min && salary.max) listing.salary = salary;

    if (address) {
      const coords = await geocodeAddress(address);
      if (coords) {
        listing.address = address;
        listing.location = {
          type: "Point",
          coordinates: [coords.lng, coords.lat],
        };
      }
    }

    // Handle Image Upload
    if (req.file) {
      const absolutePath = path.resolve(req.file.path);
      const uploadResult = await cloudinary.uploader.upload(absolutePath, {
        folder: "job-listings",
        public_id: `${listing.title.replace(/\s/g, "_")}_${Date.now()}`,
      });

      // Update image array
      listing.images = [{ url: uploadResult.secure_url, public_id: uploadResult.public_id }];

      // Cleanup: delete local file
      fs.unlink(absolutePath, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
    }

    await listing.save();
    res.status(200).json({ message: "Listing updated successfully", listing });

  } catch (err) {
  console.error("Detailed Error:", err); 
  // This sends the actual error (like "path is not defined") to your frontend
  res.status(500).json({ message: err.message }); 
}
};


// ========================
// Delete a listing
// ========================
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // 🔍 Debug logs to confirm ownership
    console.log("Listing owner:", listing.owner.toString());
    console.log("Logged in user:", req.user.id);

    // ✅ Check if logged-in user owns this listing
    if (listing.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ☁️ Optional: delete image from Cloudinary if you have publicId saved
    if (listing.imagePublicId) {
      await cloudinary.uploader.destroy(listing.imagePublicId);
      console.log("Cloudinary image deleted:", listing.imagePublicId);
    }

    // Delete listing from MongoDB
    await listing.deleteOne();

    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ========================
// EXPORTS (CommonJS)
// ========================
module.exports = {
  getAllListings,
  getMyListings,
  getSingleListing,
  getNearbyListings,
  createListing,
  updateListing,
  deleteListing
};
