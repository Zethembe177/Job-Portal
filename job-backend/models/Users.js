const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employer', 'candidate'], required: true },
  listings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }], // linked listings
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
