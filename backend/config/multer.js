// backend/config/multer.js
const multer = require('multer');
const { storage } = require('./cloudinary');

module.exports = multer({ storage });   // 5 MB limit already enforced by Cloudinary
