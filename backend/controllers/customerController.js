const Restaurant = require('../models/Restaurant');
const Booking    = require('../models/Booking');
const sendEmail  = require('../utils/sendEmail');

exports.searchRestaurants = async (req, res) => {
  try {
    const { city, state, zip, cuisine, minRating, date } = req.query;
    const match = {};
    if (city)    match.city    = city;
    if (state)   match.state   = state;
    if (zip)     match.zipCode = zip;
    if (cuisine) match.cuisine = cuisine;

    // 1) aggregate restaurants + avgRating
    const pipeline = [
      { $match: match },
      { $addFields: {
          avgRating: {
            $cond: [
              { $gt: [ { $size: '$reviews' }, 0 ] },
              { $avg: '$reviews.rating' },
              null
            ]
          }
        }
      }
    ];
    if (minRating) {
      pipeline.push({ $match: { avgRating: { $gte: parseFloat(minRating) } } });
    }
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
    const restaurants = await Restaurant.aggregate(pipeline);

    // 2) count today’s bookings
    const target = date
      ? new Date(date.slice(0,10))
      : new Date();
    const start = new Date(target); start.setHours(0,0,0,0);
    const end   = new Date(target); end.setHours(23,59,59,999);

    const counts = await Booking.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: {
          _id: '$restaurant',
          count: { $sum: 1 }
        }
      }
    ]);
    const countMap = counts.reduce((m,c) => {
      m[c._id.toString()] = c.count;
      return m;
    }, {});

    // 3) attach count to each restaurant
    const output = restaurants.map(r => ({
      ...r,
      _id: r._id,
      timesBookedToday: countMap[r._id.toString()] || 0
    }));

    return res.json(output);
  }
  catch(err) {
    console.error('searchRestaurants error:', err);
    return res.status(500).json({ message: err.message });
  }
};

exports.bookTable = async (req, res) => {
  const { restaurantId, date, time, numPeople } = req.body;
  try {
    const booking = new Booking({
      user: req.user.userId,
      restaurant: restaurantId,
      date, time, numPeople, status: 'Booked'
    });
    await booking.save();

    // send confirmation email (unchanged)…
    const restaurant = await Restaurant.findById(restaurantId);
    const subject     = 'Booking Confirmation';
    const htmlContent = `
      <h3>Your Table is Booked!</h3>
      <p>Your table at <strong>${restaurant.name}</strong> on <strong>${date}</strong> @ <strong>${time}</strong> for <strong>${numPeople}</strong> has been confirmed.</p>
    `;
    await sendEmail(req.user.email, subject, htmlContent);

    res.status(201).json({ message: 'Table booked successfully, confirmation email sent', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking
      .find({ user: req.user.userId })
      .populate('restaurant');
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant
      .findById(req.params.id)
      .populate('reviews.user','name')
      .lean();
    if (!restaurant)
      return res.status(404).json({ message: 'Restaurant not found' });

    const reviews = restaurant.reviews || [];
    restaurant.avgRating = reviews.length
      ? reviews.reduce((sum,r) => sum + r.rating, 0) / reviews.length
      : null;

    res.json(restaurant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be 1–5' });

    await Restaurant.updateOne(
      { _id: req.params.restaurantId },
      { $push: { reviews: { user: req.user.userId, rating, comment } } }
    );

    // return the updated restaurant (with avgRating)
    const restaurant = await Restaurant
      .findById(req.params.restaurantId)
      .populate('reviews.user','name')
      .lean();
    const revs = restaurant.reviews || [];
    restaurant.avgRating = revs.length
      ? revs.reduce((s,r) => s + r.rating, 0) / revs.length
      : null;

    res.json(restaurant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


















// const Restaurant = require('../models/Restaurant');
// const Booking = require('../models/Booking');
// const sendEmail = require('../utils/sendEmail');


// // exports.searchRestaurants = async (req, res) => {
// //   const { date, time, people, city, state, zip } = req.query;
// //   try {
// //     const query = {};
// //     if (city) query.city = city;
// //     if (state) query.state = state;
// //     if (zip) query.zipCode = zip;
// //     const restaurants = await Restaurant.find(query)
// //     .populate('reviews.user', 'name')  // ✅ populate review user names
// //     .lean(); // Lean objects for faster performance
// //     res.json(restaurants);
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// exports.searchRestaurants = async (req, res) => {
//   try {
//     const { city, state, zip, cuisine, minRating, date } = req.query;

//     // ─── 1) BUILD FILTER ─────────────────────────────────
//     const match = {};
//     if (city)    match.city    = city;
//     if (state)   match.state   = state;
//     if (zip)     match.zipCode = zip;
//     if (cuisine) match.cuisine = cuisine;

//     // ─── 2) AGGREGATE RESTAURANTS + avgRating ─────────────
//     const pipeline = [
//       { $match: match },
//       { $addFields: {
//           avgRating: {
//             $cond: [
//               { $gt: [ { $size: '$reviews' }, 0 ] },
//               { $avg: '$reviews.rating' },
//               null
//             ]
//           }
//         }
//       }
//     ];
//     if (minRating) {
//       pipeline.push({ $match: { avgRating: { $gte: parseFloat(minRating) } } });
//     }
//     pipeline.push({
//       $project: {
//         name: 1,
//         address: 1,
//         cuisine: 1,
//         cost: 1,
//         city: 1,
//         state: 1,
//         zipCode: 1,
//         photos: 1,
//         bookingTimes: 1,
//         avgRating: 1
//       }
//     });
//     const restaurants = await Restaurant.aggregate(pipeline);

//     // ─── 3) COUNT TODAY’S BOOKINGS ────────────────────────
//     // convert YYYY-MM-DD string into a real Date range
//     const target = date
//       ? new Date(date.slice(0,10))
//       : new Date();
//     const start = new Date(target);
//     start.setHours(0,0,0,0);
//     const end = new Date(target);
//     end.setHours(23,59,59,999);

//     const counts = await Booking.aggregate([
//       { $match: { date: { $gte: start, $lte: end } } },
//       { $group: {
//           _id: '$restaurant',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     const countMap = counts.reduce((m, c) => {
//       m[c._id.toString()] = c.count;
//       return m;
//     }, {});

//     // ─── 4) STICK counts onto each restaurant ──────────────
//     const output = restaurants.map(r => ({
//       ...r,
//       _id: r._id,
//       timesBookedToday: countMap[r._id.toString()] || 0
//     }));

//     return res.json(output);
//   }
//   catch(err) {
//     console.error('searchRestaurants error:', err);
//     return res.status(500).json({ message: err.message });
//   }
// };



// exports.bookTable = async (req, res) => {
//   const { restaurantId, date, time, numPeople } = req.body;
//   try {
//     // Create the booking record
//     const booking = new Booking({
//       user: req.user.userId,
//       restaurant: restaurantId,
//       date,
//       time,
//       numPeople,
//       status: 'Booked'
//     });

//     await booking.save();

//     // Look up the restaurant details for email content
//     const restaurant = await Restaurant.findById(restaurantId);

//     // Prepare email details
//     const subject = 'Booking Confirmation';
//     const htmlContent = `
//       <h3>Your Table is Booked!</h3>
//       <p>Dear Customer,</p>
//       <p>Your table booking at <strong>${restaurant ? restaurant.name : 'the restaurant'}</strong> on <strong>${date}</strong> at <strong>${time}</strong> for <strong>${numPeople}</strong> person(s) is confirmed.</p>
//       <p>Thank you for choosing our service!</p>
//     `;

//     // Get user's email from token (assumed to be in req.user.email; if not, fetch from DB)
//     const userEmail = req.user.email; 

//     // Send confirmation email
//     await sendEmail(userEmail, subject, htmlContent);

//     res.status(201).json({ message: 'Table booked successfully, confirmation email sent', booking });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.cancelBooking = async (req, res) => {
//   try {
//     const booking = await Booking.findOneAndDelete({
//       _id: req.params.id,
//       user: req.user.userId, // Ensure it's their booking
//     });

//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }
//     res.json({ message: 'Booking cancelled' });
//   } catch (err) {
//     console.error('Cancel booking error:', err);
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// exports.getMyBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find({ user: req.user.userId }).populate('restaurant');
//     res.json(bookings);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // controllers/customerController.js
// exports.getRestaurant = async (req, res) => {
//   try {
//     const restaurant = await Restaurant
//       .findById(req.params.id)
//       .populate('reviews.user','name')
//       .lean();

//     if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

//     const reviews = restaurant.reviews || [];
//     restaurant.avgRating = reviews.length
//       ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
//       : null;

//     res.json(restaurant);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: err.message });
//   }
// };
