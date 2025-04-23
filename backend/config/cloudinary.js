// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// every upload goes into the "restaurants" folder
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'restaurants',
    // keep the original extension (jpg / png / webp …)
    public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
  })
});

module.exports = { cloudinary, storage };
