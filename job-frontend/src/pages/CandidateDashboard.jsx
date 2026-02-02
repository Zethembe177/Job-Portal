import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
const [radius, setRadius] = useState(10);
const [userLocation, setUserLocation] = useState(null);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    minSalary: searchParams.get("minSalary") || "",
    maxSalary: searchParams.get("maxSalary") || "",
  });

  // ----------------------------
  // NORMAL FILTER SEARCH
  // ----------------------------
  const fetchListings = async () => {
    try {
      setLoading(true);
      setError("");
const API_BASE_URL = import.meta.env.VITE_API_URL;
const query = new URLSearchParams(filters).toString();
const res = await fetch(`${API_BASE_URL}/api/listings?${query}`);
const data = await res.json();
      setListings(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };
const getUserLocation = () => {
  if (!navigator.geolocation) {
    setError("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    },
    () => {
      setError("Location access denied");
    }
  );
};

  useEffect(() => {
    setSearchParams(filters);
    fetchListings();
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // ----------------------------
  // 🔥 SEARCH NEARBY (NEW)
  // ----------------------------
  const findNearbyJobs = async () => {
  if (!userLocation) {
    setError("Please allow location access first");
    return;
  }

  try {
    setLoading(true);
    setError("");

    const API_BASE_URL = import.meta.env.VITE_API_URL;
const res = await fetch(
  `${API_BASE_URL}/api/listings/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${radius}`
);

    const data = await res.json();
    setListings(data);
  } catch (err) {
    console.error(err);
    setError("Failed to load nearby jobs");
  } finally {
    setLoading(false);
  }
};

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Candidate Dashboard</h1>

      {/* Filter Panel */}
      <div className="bg-white p-4 rounded shadow mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search jobs..."
          name="search"
          value={filters.search}
          onChange={handleChange}
          className="px-3 py-2 border rounded flex-1"
        />

        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Categories</option>
          <option value="Software Development">Software Development</option>
          <option value="Marketing">Marketing</option>
          <option value="Finance">Finance</option>
          <option value="Design">Design</option>
          <option value="Sales">Sales</option>
          <option value="Human Resources">Human Resources</option>
        </select>

        <input
          type="number"
          name="minSalary"
          placeholder="Min Salary"
          value={filters.minSalary}
          onChange={handleChange}
          className="px-3 py-2 border rounded"
        />

        <input
          type="number"
          name="maxSalary"
          placeholder="Max Salary"
          value={filters.maxSalary}
          onChange={handleChange}
          className="px-3 py-2 border rounded"
        />

        {/* 🔥 Nearby Button */}
        <button
          onClick={fetchListings}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Search 
        </button>
        {/* Location + Nearby Controls */}
<div className="flex items-center gap-3">
  <button
    onClick={getUserLocation}
    className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
  >
    Use My Location
  </button>

  <button
    onClick={findNearbyJobs}
    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
  >
    Search Nearby
  </button>

  <div className="flex items-center gap-2">
    <label className="text-sm">Radius (km)</label>
    <input
      type="range"
      min="1"
      max="50"
      value={radius}
      onChange={(e) => setRadius(e.target.value)}
    />
    <span className="text-sm">{radius}km</span>
  </div>
</div>

      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.length > 0 ? (
          listings.map((listing) => (
            <div key={listing._id} className="bg-violet-50 p-4 rounded shadow">
              <h2 className="text-xl font-semibold">{listing.title}</h2>
              {listing.images && listing.images.length > 0 && (
  <img
    src={listing.images[0].url}
    alt={listing.title}
    className="w-full h-40 object-cover rounded mb-4"
  />
)}

              <p className="text-gray-600">Category: {listing.category}</p>
              <p className="text-gray-600">
                Salary: {listing.salary.min} – {listing.salary.max}
              </p>
              <p className="text-gray-600">
                Location: {listing.address}
              </p>

              <button
                onClick={() => navigate(`/listing/${listing._id}`)}
                className="bg-indigo-300 text-white px-3 py-1 rounded mt-2 hover:bg-blue-600"
              >
                View Details
              </button>
            </div>
          ))
        ) : (
          !loading && <p>No listings found.</p>
        )}
      </div>
    </div>
  );
}
