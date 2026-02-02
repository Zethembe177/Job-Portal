const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  getAllListings,
  getSingleListing,
  getMyListings,
  createListing,
  updateListing,
  deleteListing,
  getNearbyListings,
} = require("../controllers/listingController");

const { protect } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

router.get("/", getAllListings);
router.get("/nearby", getNearbyListings);
router.get("/view/:id", getSingleListing);

/*
|--------------------------------------------------------------------------
| EMPLOYER ROUTES (PROTECTED)
|--------------------------------------------------------------------------
*/

// Get listings created by logged-in employer
router.get("/my", protect, roleMiddleware("employer"), getMyListings);

// Create a listing
router.post(
  "/",
  protect,
  roleMiddleware("employer"),
  upload.single("image"),
  createListing
);

// Update a listing
router.put(
  "/:id",
  protect,
  roleMiddleware("employer"),
  upload.single("image"),
  updateListing
);

// Delete a listing
router.delete(
  "/:id",
  protect,
  roleMiddleware("employer"),
  deleteListing
);

module.exports = router;
