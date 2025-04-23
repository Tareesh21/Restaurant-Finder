const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const adminController = require('../controllers/adminController');

router.use(auth, roleCheck(['Admin']));

router.get('/restaurants', adminController.getAllRestaurants);
router.get('/pending', adminController.getPendingRestaurants);
router.put('/approve/:id', adminController.approveRestaurant);
router.delete('/remove/:id', adminController.removeRestaurant);
router.get('/analytics', adminController.getMonthlyAnalytics);

module.exports = router;
