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
  date: {
    type: Date,
    required: true
  },      
  time: String,       
  numPeople: Number,
  status: {
    type: String,
    enum: ['Booked', 'Cancelled'],
    default: 'Booked'
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
