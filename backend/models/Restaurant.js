const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true },
  comment: { type: String }
}, { timestamps: true });

const restaurantSchema = new mongoose.Schema({
  name: String,
  address: String,
  cuisine: String,
  cost: Number,
  contact: String,
  city: String,
  state: String,
  zipCode: String,
  availableTables: Number,
  bookingTimes: {
    type: [String],
    default: ['18:00','19:00','20:00','21:00']
  },
  // bookingTimes: [String], // ["12:00", "13:00", ...]
  photos: [String],
  reviews: [{
    user: String,
    rating: Number,
    comment: String
  }],
  approved: {
    type: Boolean,
    default: false
  },

  // ✅ NEW: Manager field to link owner
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviews: [reviewSchema] 
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
