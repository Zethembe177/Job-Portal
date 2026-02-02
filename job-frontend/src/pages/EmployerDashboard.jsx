import React, { useEffect, useState } from "react";

export default function EmployerDashboard() {
  const [listings, setListings] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    salary: { min: "", max: "" },
    address: "",
    image: null,      // single image for upload
    oldImage: null,   // added to preview existing image when editing
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get token
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not logged in. Redirecting...");
      window.location.href = "/login";
      return null;
    }
    return token;
  };

  // Fetch listings
  const fetchListings = async () => {
    const token = getToken();
    if (!token) return;

    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL;
const res = await fetch(`${API_BASE_URL}/api/listings/my`, {
  headers: { Authorization: `Bearer ${token}` },
});
      if (res.status === 401) {
        alert("Session expired. Log in again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "minSalary" || name === "maxSalary") {
      setFormData((prev) => ({
        ...prev,
        salary: {
          ...prev.salary,
          [name === "minSalary" ? "min" : "max"]: Number(value),
        },
      }));
    } else if (name === "image") {
      setFormData((prev) => ({
        ...prev,
        image: files[0] || null,
        oldImage: null, // remove old image preview if new image selected
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Submit / create or update listing
  // Submit / create or update listing
const handleSubmit = async (e) => {
  e.preventDefault();
  const token = getToken();
  if (!token) return;

  // Basic validation
  if (
    !formData.title ||
    !formData.category ||
    !formData.salary.min ||
    !formData.salary.max ||
    !formData.address
  ) {
    alert("Please provide all required fields");
    return;
  }

  try {
    const method = editingId ? "PUT" : "POST";
   const API_BASE_URL = import.meta.env.VITE_API_URL;
const url = editingId
  ? `${API_BASE_URL}/api/listings/${editingId}`
  : `${API_BASE_URL}/api/listings`;

    // Use FormData for sending text + file
    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("category", formData.category);
    submitData.append("address", formData.address);
    submitData.append("salary[min]", formData.salary.min);
    submitData.append("salary[max]", formData.salary.max);

    // Only append image if user selected a new one
    if (formData.image) {
      submitData.append("image", formData.image);
    }

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`, // ❌ DO NOT set Content-Type
      },
      body: submitData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");

    // Reset form
    setFormData({
      title: "",
      category: "",
      salary: { min: "", max: "" },
      address: "",
      image: null,
    });
    setEditingId(null);
    fetchListings();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

  // Edit listing
  const handleEdit = (listing) => {
    setFormData({
      title: listing.title || "",
      category: listing.category || "",
      salary: {
        min: listing.salary?.min || "",
        max: listing.salary?.max || "",
      },
      address: listing.address || "",
      image: null, // leave blank for new upload
      oldImage: listing.images && listing.images.length > 0 ? listing.images[0].url || listing.images[0] : null, // preview old image
    });
    setEditingId(listing._id);
  };

  // Delete listing
  const handleDelete = async (id) => {
    const token = getToken();
    if (!token) return;

    if (!window.confirm("Are you sure you want to delete this listing?")) return;

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
const res = await fetch(`${API_BASE_URL}/api/listings/${id}`, {
  method: "DELETE",
  headers: { Authorization: `Bearer ${token}` },
});
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      fetchListings();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Employer Dashboard</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          name="minSalary"
          placeholder="Min Salary"
          value={formData.salary.min}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          name="maxSalary"
          placeholder="Max Salary"
          value={formData.salary.max}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="border p-2 rounded"
        />
        {/* Preview old image if editing */}
        {formData.oldImage && !formData.image && (
          <img
            src={formData.oldImage}
            alt="Current listing"
            className="w-32 h-20 object-cover rounded mb-2"
          />
        )}
        <button
          type="submit"
          className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
        >
          {editingId ? "Update Listing" : "Create Listing"}
        </button>
      </form>

      {/* Listings */}
      {loading ? (
        <p>Loading...</p>
      ) : listings.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <div key={listing._id} className="bg-violet-50 p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">{listing.title}</h2>
              {listing.images && listing.images.length > 0 && (
                <img
                  src={listing.images[0].url || listing.images[0]}
                  alt={listing.title}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              )}
              <p>Category: {listing.category}</p>
              <p>
                Salary: {listing.salary.min} - {listing.salary.max}
              </p>
              <p>Address: {listing.address}</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleEdit(listing)}
                  className="bg-amber-300 text-white px-2 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(listing._id)}
                  className="bg-red-300 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
                <button
                  onClick={() => (window.location.href = `/listing/${listing._id}`)}
                  className="bg-indigo-300 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No listings found.</p>
      )}
    </div>
  );
}
