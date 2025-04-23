const Restaurant = require('../models/Restaurant');
const Booking = require('../models/Booking');
const sendEmail = require('../utils/sendEmail');



// exports.searchRestaurants = async (req, res) => {
//   const { date, time, people, city, state, zip } = req.query;
//   try {
//     const query = {};
//     if (city) query.city = city;
//     if (state) query.state = state;
//     if (zip) query.zipCode = zip;
//     const restaurants = await Restaurant.find(query)
//     .populate('reviews.user', 'name')  // ✅ populate review user names
//     .lean(); // Lean objects for faster performance
//     res.json(restaurants);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// controllers/customerController.js
exports.searchRestaurants = async (req, res) => {
  try {
    // pull all of the possible filters out of the query
    const { city, state, zip, cuisine, minRating } = req.query;

    // build up a simple match object
    const match = {};
    if (city)    match.city    = city;
    if (state)   match.state   = state;
    if (zip)     match.zipCode = zip;
    if (cuisine) match.cuisine = cuisine;

    // start an aggregation
    const pipeline = [
      { $match: match },
      // compute an avgRating field
      {
        $addFields: {
          avgRating: {
            $cond: [
              { $gt: [ { $size: "$reviews" }, 0 ] },
              { $avg: "$reviews.rating" },
              null
            ]
          }
        }
      }
    ];

    // if they supplied a minimum rating, filter by it
    if (minRating) {
      pipeline.push({
        $match: { avgRating: { $gte: parseFloat(minRating) } }
      });
    }

    // project only the fields your UI needs
    pipeline.push({
      $project: {
        name: 1,
        address: 1,
        cuisine: 1,
        cost: 1,
        city: 1,
        state: 1,
        zipCode: 1,
        photos: 1,
        bookingTimes: 1,
        avgRating: 1
      }
    });

    const results = await Restaurant.aggregate(pipeline);
    return res.json(results);
  }
  catch(err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};



exports.bookTable = async (req, res) => {
  const { restaurantId, date, time, numPeople } = req.body;
  try {
    // Create the booking record
    const booking = new Booking({
      user: req.user.userId,
      restaurant: restaurantId,
      date,
      time,
      numPeople,
      status: 'Booked'
    });

    await booking.save();

    // Look up the restaurant details for email content
    const restaurant = await Restaurant.findById(restaurantId);

    // Prepare email details
    const subject = 'Booking Confirmation';
    const htmlContent = `
      <h3>Your Table is Booked!</h3>
      <p>Dear Customer,</p>
      <p>Your table booking at <strong>${restaurant ? restaurant.name : 'the restaurant'}</strong> on <strong>${date}</strong> at <strong>${time}</strong> for <strong>${numPeople}</strong> person(s) is confirmed.</p>
      <p>Thank you for choosing our service!</p>
    `;

    // Get user's email from token (assumed to be in req.user.email; if not, fetch from DB)
    const userEmail = req.user.email; 

    // Send confirmation email
    await sendEmail(userEmail, subject, htmlContent);

    res.status(201).json({ message: 'Table booked successfully, confirmation email sent', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId, // Ensure it's their booking
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.userId }).populate('restaurant');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRestaurant = async (req, res) => {
  try {
    // fetch the restaurant and populate the reviewers’ names
    const restaurant = await Restaurant
      .findById(req.params.id)
      .populate('reviews.user', 'name')
      .lean(); 

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // compute an avgRating field
    const reviews = restaurant.reviews || [];
    restaurant.avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

    res.json(restaurant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
