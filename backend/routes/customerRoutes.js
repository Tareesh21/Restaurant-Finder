const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const customerController = require('../controllers/customerController');
const Restaurant = require('../models/Restaurant');

router.get('/search', auth, roleCheck(['Customer']), customerController.searchRestaurants);
router.post('/book', auth, roleCheck(['Customer']), customerController.bookTable);
router.delete('/cancel/:id', auth, roleCheck(['Customer']), customerController.cancelBooking);
router.get('/my-bookings', auth, roleCheck(['Customer']), customerController.getMyBookings);
router.get('/get-restaurant/:id', auth, roleCheck(['Customer']), async (req, res) => {
    try {
      const restaurant = await Restaurant.findById(req.params.id)
        .populate('reviews.user', 'name') // ✅ FIX: populate reviews also
        .lean(); // Lean improves performance
  
      if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

      res.json(restaurant);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

  
router.post('/review/:restaurantId', auth, roleCheck(['Customer']), async (req, res) => {
    try {
      const { rating, comment } = req.body;
  
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      await Restaurant.updateOne(
        { _id: req.params.restaurantId },
        { 
          $push: { 
            reviews: { 
              user: req.user.userId, 
              rating, 
              comment 
            } 
          } 
        }
      );
  
      res.json({ message: 'Review added!' });
    } catch (err) {
      console.error('Review error:', err);
      res.status(500).json({ message: err.message });
    }
  });
   
router.get(
  '/get-restaurant/:id',
  auth,
  roleCheck(['Customer']),
  customerController.getRestaurant
);

module.exports = router;
