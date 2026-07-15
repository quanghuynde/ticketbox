const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadBuffer } = require('../services/cloudinaryService');
const { verifyToken } = require('../middleware/auth');

// Multer Config
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(file.originalname.toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Chỉ hỗ trợ upload các định dạng ảnh (jpeg, jpg, png, webp)!'));
  }
});

// POST /api/upload
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Vui lòng chọn một file ảnh' });
  }

  try {
    const result = await uploadBuffer(req.file.buffer, {
      folder: 'ticketbox/users',
      resource_type: 'image',
    });

    return res.status(200).json({
      message: 'Upload ảnh thành công',
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ message: 'Lỗi tải ảnh lên Cloudinary.' });
  }
});

module.exports = router;
