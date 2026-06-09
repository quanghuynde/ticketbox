const Order = require('../models/Order');

const getAll = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách đơn hàng', error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết đơn hàng', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Mã đơn hàng đã tồn tại', error: err.message });
    }
    res.status(400).json({ message: 'Lỗi tạo đơn hàng', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.orderId, req.body, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    res.status(200).json(order);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Mã đơn hàng đã tồn tại', error: err.message });
    }
    res.status(400).json({ message: 'Lỗi cập nhật đơn hàng', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    res.status(200).json({ message: 'Xóa đơn hàng thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xóa đơn hàng', error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
