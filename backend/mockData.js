const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedData = async () => {
  try {
    const hashedPwd = await bcrypt.hash("secret123", 10);

    // Seed users safely
    const existingUsers = await User.find();
    if (existingUsers.length === 0) {
      const customers = [
        { name: "Alice Johnson", email: "alice@example.com", password: hashedPwd, role: "Customer" },
        { name: "Bob Smith", email: "bob@example.com", password: hashedPwd, role: "Customer" }
      ];

      const managers = [
        { name: "Chef Mario", email: "mario@example.com", password: hashedPwd, role: "RestaurantManager" },
        { name: "Chef Aditi", email: "aditi@example.com", password: hashedPwd, role: "RestaurantManager" }
      ];

      await User.insertMany([...customers, ...managers]);
      console.log("✅ Users seeded");
    } else {
      console.log("🔁 Users already exist");
    }

    const allUsers = await User.find();
    const mario = allUsers.find(u => u.email === "mario@example.com");
    const aditi = allUsers.find(u => u.email === "aditi@example.com");

    // Seed restaurants safely
    const existingRestaurants = await Restaurant.find();
    if (existingRestaurants.length === 0 && mario && aditi) {
      await Restaurant.insertMany([
        {
          name: "The Italian Corner",
          address: "123 Pasta St",
          cuisine: "Italian",
          cost: 3,
          contact: "1234567890",
          city: "SanJose",
          state: "CA",
          zipCode: "95110",
          availableTables: 10,
          bookingTimes: ["18:00", "19:00", "20:00"],
          photos: [""],
          manager: mario._id
        },
        {
          name: "Bombay Spice",
          address: "88 Curry Ave",
          cuisine: "Indian",
          cost: 2,
          contact: "9876543210",
          city: "SanJose",
          state: "CA",
          zipCode: "95110",
          availableTables: 8,
          bookingTimes: ["18:30", "19:30", "20:30"],
          photos: [""],
          manager: aditi._id
        }
      ]);
      console.log("✅ Restaurants seeded with manager linkage");
    } else {
      console.log("🔁 Restaurants already exist");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
};

seedData();
