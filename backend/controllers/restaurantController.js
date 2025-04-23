const Restaurant = require('../models/Restaurant');
const Booking = require('../models/Booking');



// helper: turn every uploaded file into its Cloudinary URL
const filesToUrls = (files = []) => files.map(f => f.path);   // f.path === CDN URL

// exports.addRestaurant = async (req, res) => {
//   try {
//     // const newRestaurant = await Restaurant.create({
//     //   ...req.body,
//     //   manager: req.user.userId    
//     // });
//     const newRestaurant = await Restaurant.create({
//       ...req.body,
//       photos: filesToUrls(req.files),  //  <‑‑ NEW
//       manager: req.user.userId
//     });
//     console.log("REQ USER", req.user);
//     res.status(201).json({ message: 'Restaurant added successfully', restaurant: newRestaurant });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


exports.addRestaurant = async (req, res) => {
  try {
    // parse any incoming JSON‑array or comma‑string
    let photos = [];
    if (req.body.photos) {
      photos = Array.isArray(req.body.photos)
        ? req.body.photos
        : req.body.photos.split(',').map(u=>u.trim()).filter(u=>u);
    }

    const newRestaurant = await Restaurant.create({
      ...req.body,
      photos,                             // <-- NEW: attach the URL array
      manager: req.user.userId
    });
    res.status(201).json({ restaurant: newRestaurant });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.updateRestaurant = async (req, res) => {
  try {
    let photosUpdate;
    if (req.body.photos) {
      photosUpdate = Array.isArray(req.body.photos)
        ? req.body.photos
        : req.body.photos.split(',').map(u=>u.trim()).filter(u=>u);
    }

    const update = { ...req.body };
   if (photosUpdate) update.photos = photosUpdate;  // <-- NEW

    const updated = await Restaurant.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    res.json({ restaurant: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// exports.updateRestaurant = async (req, res) => {
//   const restaurantId = req.params.id;

//   try {
//     const restaurant = await Restaurant.findById(restaurantId);
//     if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

//     // const updated = await Restaurant.findByIdAndUpdate(restaurantId, req.body, { new: true });
//     // merge new body + (optionally) new photos
//     const update = { ...req.body };
//     if (req.files?.length) update.photos = filesToUrls(req.files);
//     const updated = await Restaurant.findByIdAndUpdate(restaurantId, update, { new: true });
//     res.json({ message: 'Restaurant updated', restaurant: updated });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

exports.getManagerBookings = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const bookings = await Booking.find({ restaurant: restaurantId }).populate('user', 'name email');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.deleteRestaurant = async (req, res) => {
    try {
      const rest = await Restaurant.findById(req.params.id);
      if (!rest) return res.status(404).json({ message: "Restaurant not found" });
      console.log("Authenticated user:", req.user);
      // 👇 Prevent managers from deleting others' restaurants
      if (rest.manager.toString() !== req.user.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      await rest.deleteOne();
      res.json({ message: "Restaurant deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
