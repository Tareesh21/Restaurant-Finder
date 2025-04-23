const Restaurant = require('../models/Restaurant');
const Booking = require('../models/Booking');

exports.getAllRestaurants = async (req, res) => {
  const restaurants = await Restaurant.find();
  res.json(restaurants);
};

exports.getPendingRestaurants = async (req, res) => {
  const pending = await Restaurant.find({ approved: false });
  res.json(pending);
};

exports.approveRestaurant = async (req, res) => {
  const { id } = req.params;
  const restaurant = await Restaurant.findByIdAndUpdate(id, { approved: true }, { new: true });
  res.json({ message: 'Restaurant approved', restaurant });
};

exports.removeRestaurant = async (req, res) => {
  const { id } = req.params;
  await Restaurant.findByIdAndDelete(id);
  res.json({ message: 'Restaurant deleted' });
};

exports.getMonthlyAnalytics = async (req, res) => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const bookings = await Booking.find({ createdAt: { $gte: oneMonthAgo } }).populate('restaurant user');
  res.json({ totalBookings: bookings.length, bookings });
};
