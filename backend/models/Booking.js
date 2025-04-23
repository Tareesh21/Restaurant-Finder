const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  date: String,       // e.g. "2025-04-11"
  time: String,       // e.g. "19:00"
  numPeople: Number,
  status: {
    type: String,
    enum: ['Booked', 'Cancelled'],
    default: 'Booked'
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
