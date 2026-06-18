const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
// Import existing auth middleware if needed to protect upload route
const { verifyToken, isAdmin } = require('../middleware/auth');

// Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Chỉ hỗ trợ upload các định dạng ảnh (jpeg, jpg, png, webp)!'));
  }
});

// POST /api/upload
router.post('/', verifyToken, isAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Vui lòng chọn một file ảnh' });
  }
  
  // Construct the URL to the uploaded file
  // Assuming the client knows the server host or using relative path
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ 
    message: 'Upload ảnh thành công',
    url: fileUrl 
  });
});

module.exports = router;
