const express = require("express");

const Listing = require("../models/Listings");

const router = express.Router();

/**
 * GET /api/analytics/summary
 * Employer-only analytics summary
 */
router.get("/summary", async (req, res) => {
  try {
    const stats = await Listing.aggregate([
      {
        $group: {
          _id: "$category",
          totalListings: { $sum: 1 },
          avgSalary: { $avg: "$salary.max" }
        }
      },
      {
        $sort: { totalListings: -1 }
      }
    ]);

    const overall = await Listing.aggregate([
      {
        $group: {
          _id: null,
          totalListings: { $sum: 1 },
          averageSalary: { $avg: "$salary.max" }
        }
      }
    ]);

    res.json({
      perCategory: stats,
      overall: overall[0] || {}
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Analytics error" });
  }
});

module.exports = router;