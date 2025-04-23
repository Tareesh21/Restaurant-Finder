const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const path    = require('path');
const connectDB      = require('./config/db');
const authRoutes     = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const adminRoutes    = require('./routes/adminRoutes');
const Restaurant     = require('./models/Restaurant');
const User           = require('./models/User');

dotenv.config();
connectDB();

const app = express();

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// parse JSON bodies
app.use(express.json());

// serve any file in ./uploads under http://localhost:5000/uploads/<filename>
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// ─── API ROUTES ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/admin', adminRoutes);

// ─── SEED SCRIPT ───────────────────────────────────────────────────────────────
const seedRestaurant = async () => {
  const existing = await Restaurant.findOne({ name: 'Tandoori Palace' });
  if (!existing) {
    const manager = await User.findOne({ role: 'RestaurantManager' });
    if (!manager) {
      console.warn('⚠️ No manager found to seed restaurant');
      return;
    }

    await Restaurant.create({
      name: 'Tandoori Palace',
      address: '123 Curry Lane',
      cuisine: 'Indian',
      cost: 3,
      contact: '1234567890',
      city: 'SanJose',
      state: 'CA',
      zipCode: '95110',
      availableTables: 10,
      bookingTimes: ['18:00', '19:00', '20:00'],
      photos: [""],
      manager: manager._id
    });

    console.log('🌱 Restaurant seeded!');
  }
};
seedRestaurant();

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server starting at ${PORT}`));
