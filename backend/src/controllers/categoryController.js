const Category = require('../models/Category');

// GET /api/categories
const getAll = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách danh mục', error: err.message });
  }
};

// GET /api/categories/:id
const getById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết danh mục', error: err.message });
  }
};

// POST /api/categories (Admin only)
const create = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });

    const existing = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) return res.status(400).json({ message: 'Danh mục này đã tồn tại' });

    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: 'Lỗi tạo danh mục', error: err.message });
  }
};

// PUT /api/categories/:id (Admin only)
const update = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.status(200).json(category);
  } catch (err) {
    res.status(400).json({ message: 'Lỗi cập nhật danh mục', error: err.message });
  }
};

// DELETE /api/categories/:id (Admin only)
const remove = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.status(200).json({ message: 'Xóa danh mục thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xóa danh mục', error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
