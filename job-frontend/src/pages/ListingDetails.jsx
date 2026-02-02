import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAuth } from "../context/AuthContext"; // ✅ Import AuthContext

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ Get user from AuthContext
  const [listing, setListing] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL;
const res = await fetch(`${API_BASE_URL}/api/listings/view/${id}`);
        const data = await res.json();
        setListing(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchListing();
  }, [id]);

  if (!listing) return <p>Loading...</p>;

  const [lng, lat] = listing.location?.coordinates || [0, 0];

  const handleBack = () => {
    if (user?.role === "employer") {
      navigate("/employer");
    } else if (user?.role === "candidate") {
      navigate("/candidate");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{listing.title}</h1>

      <p className="text-gray-600">Category: {listing.category}</p>
      <p className="text-gray-600">
        Salary: {listing.salary.min} – {listing.salary.max}
      </p>
      <p className="text-gray-600">Address: {listing.address}</p>

      <div className="mt-4 h-96">
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <Marker position={[lat, lng]}>
            <Popup>{listing.title}</Popup>
          </Marker>
        </MapContainer>
      </div>

      <button
        onClick={handleBack}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Back
      </button>
      <button onClick={() => handleDelete(listing._id)}>
  Delete
</button>

    </div>
  );
}
