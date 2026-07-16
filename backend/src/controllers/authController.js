const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOtpCode, sendOtpEmail } = require('../services/mailService');

const otpStore = new Map();
const otpRateLimitStore = new Map();

const createOtpEntry = (email) => {
  const otp = generateOtpCode();
  otpStore.set(email.toLowerCase(), { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
  return otp;
};

const getOtpEntry = (email) => {
  const normalized = email.toLowerCase();
  const entry = otpStore.get(normalized);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalized);
    return null;
  }
  return entry;
};

const deleteOtpEntry = (email) => {
  otpStore.delete(email.toLowerCase());
};

const getRateLimitEntry = (email) => {
  const normalized = email.toLowerCase();
  const entry = otpRateLimitStore.get(normalized);
  if (!entry) return null;

  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  if (now - entry.firstSentAt >= windowMs) {
    otpRateLimitStore.delete(normalized);
    return null;
  }

  return entry;
};

const canSendOtp = (email) => {
  const normalized = email.toLowerCase();
  const entry = getRateLimitEntry(normalized);
  if (!entry) {
    return { allowed: true, retryAfter: 0, message: '' };
  }

  const now = Date.now();
  if (entry.count >= 3) {
    const retryAfterSeconds = Math.ceil((entry.firstSentAt + 10 * 60 * 1000 - now) / 1000);
    return {
      allowed: false,
      retryAfter: retryAfterSeconds,
      message: `Bạn đã gửi quá nhiều mã OTP. Vui lòng thử lại sau ${Math.max(1, Math.ceil(retryAfterSeconds / 60))} phút.`,
    };
  }

  if (entry.lastSentAt && now - entry.lastSentAt < 60 * 1000) {
    const retryAfterSeconds = Math.ceil((entry.lastSentAt + 60 * 1000 - now) / 1000);
    return {
      allowed: false,
      retryAfter: retryAfterSeconds,
      message: `Bạn cần đợi ${retryAfterSeconds} giây trước khi gửi lại OTP.`,
    };
  }

  return { allowed: true, retryAfter: 0, message: '' };
};

const recordOtpSend = (email) => {
  const normalized = email.toLowerCase();
  const existing = getRateLimitEntry(normalized);
  if (!existing) {
    otpRateLimitStore.set(normalized, { count: 1, firstSentAt: Date.now(), lastSentAt: Date.now() });
    return;
  }

  existing.count += 1;
  existing.lastSentAt = Date.now();
  otpRateLimitStore.set(normalized, existing);
};

// Register a new user
const register = async (req, res) => {
  try {
    const { fullName, email, password, role, otp } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ các thông tin bắt buộc (họ tên, email, mật khẩu).' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email này đã được sử dụng.' });
    }

    if (!otp) {
      const { allowed, message } = canSendOtp(normalizedEmail);
      if (!allowed) {
        return res.status(429).json({ message });
      }

      const otpCode = createOtpEntry(normalizedEmail);
      recordOtpSend(normalizedEmail);
      await sendOtpEmail({ to: normalizedEmail, fullName, otp: otpCode });
      return res.status(200).json({
        message: 'Mã OTP đã được gửi tới email của bạn. Vui lòng nhập mã để hoàn tất đăng ký.',
      });
    }

    const storedOtp = getOtpEntry(normalizedEmail);
    if (!storedOtp) {
      return res.status(400).json({ message: 'Mã OTP đã hết hạn hoặc không tồn tại. Vui lòng gửi lại mã mới.' });
    }

    if (storedOtp.otp !== otp) {
      return res.status(400).json({ message: 'Mã OTP không chính xác. Vui lòng thử lại.' });
    }

    deleteOtpEntry(normalizedEmail);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user. Allow role assignment for easy setup/testing, default to 'customer'
    const user = new User({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'customer',
    });

    await user.save();

    // Exclude password from output
    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      message: 'Đăng ký người dùng thành công. Vui lòng đăng nhập để tiếp tục.',
      user: userResponse,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ trong quá trình đăng ký.' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền email và mật khẩu.' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không hợp lệ.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không hợp lệ.' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ bộ phận hỗ trợ.' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      message: 'Đăng nhập thành công.',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ trong quá trình đăng nhập.' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Vui lòng nhập email.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này.' });
    }

    const { allowed, message } = canSendOtp(normalizedEmail);
    if (!allowed) {
      return res.status(429).json({ message });
    }

    const otpCode = createOtpEntry(normalizedEmail);
    recordOtpSend(normalizedEmail);
    await sendOtpEmail({
      to: normalizedEmail,
      fullName: user.fullName,
      otp: otpCode,
      purpose: 'reset password',
    });

    res.status(200).json({
      message: 'Mã OTP đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ trong quá trình gửi OTP.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ email, OTP và mật khẩu mới.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 8 ký tự.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const storedOtp = getOtpEntry(normalizedEmail);
    if (!storedOtp) {
      return res.status(400).json({ message: 'Mã OTP đã hết hạn hoặc không tồn tại. Vui lòng gửi lại mã mới.' });
    }

    if (storedOtp.otp !== otp) {
      return res.status(400).json({ message: 'Mã OTP không chính xác. Vui lòng thử lại.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    deleteOtpEntry(normalizedEmail);

    res.status(200).json({
      message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ trong quá trình đổi mật khẩu.' });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
