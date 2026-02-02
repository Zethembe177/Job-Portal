require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const analyticsRoutes = require("./routes/analyticsRoutes");
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Routes
const listingRoutes = require('./routes/listings');
app.use('/api/listings', listingRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.use("/api/analytics", analyticsRoutes);
// Connect to MongoDB Atlas with TLS options
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tls: true,                       // enable TLS
  tlsAllowInvalidCertificates: true // for local dev only
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
