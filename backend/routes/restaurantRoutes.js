const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const Restaurant = require('../models/Restaurant');
const upload = require('../config/multer'); 
const {
  addRestaurant,
  updateRestaurant,
  getManagerBookings,
  deleteRestaurant
} = require('../controllers/restaurantController');

// All routes protected by auth + must be a RestaurantManager
router.post('/add', auth, roleCheck(['RestaurantManager']), upload.array('photos', 5), addRestaurant);
router.put('/update/:id', auth, roleCheck(['RestaurantManager']), upload.array('photos', 5), updateRestaurant);
router.get('/bookings/:restaurantId', auth, roleCheck(['RestaurantManager']), getManagerBookings);
router.delete('/delete/:id', auth, roleCheck(['RestaurantManager']), deleteRestaurant);
router.get('/my-listings', auth, roleCheck(['RestaurantManager']), async (req, res) => {
    try {
      const listings = await Restaurant.find({ manager: req.user.userId });
      res.json(listings);
      console.log("Manager ID from token:", req.user.userId);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  

module.exports = router;
