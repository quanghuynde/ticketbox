# TicketBox - Hệ thống Quản lý và Đặt vé Sự kiện

TicketBox là một ứng dụng nền tảng cho phép người dùng tìm kiếm, đặt vé và đánh giá các sự kiện. Hệ thống được tích hợp cổng thanh toán tự động và hệ thống quản lý đơn hàng chuyên nghiệp.

## 🚀 Công nghệ sử dụng

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JSON Web Token (JWT), BcryptJS
- **Payment:** Tích hợp SePay (VietQR)
- **Frontend:** React (Vite)

## ✨ Tính năng chính

### 1. Quản lý Sự kiện & Vé
- Xem danh sách sự kiện, chi tiết sự kiện.
- Quản lý các loại vé cho từng sự kiện.

### 2. Hệ thống Thanh toán (Payment)
- Tự động tạo mã QR VietQR cho từng đơn hàng qua cổng SePay.
- Xác nhận giao dịch tự động qua Webhook.
- Kiểm tra trạng thái thanh toán thời gian thực.

### 3. Đánh giá (Reviews)
- Người dùng có thể để lại đánh giá và điểm số (1-5 sao) cho các sự kiện đã tham gia.
- Hiển thị danh sách đánh giá theo từng sự kiện.

### 4. Quản lý Đơn hàng (Orders)
- Tạo đơn hàng và theo dõi trạng thái (`pending`, `paid`, `cancelled`).

## 🛠 Cấu trúc thư mục Backend

```text
backend/
├── src/
│   ├── config/         # Cấu hình db, auth
│   ├── controllers/    # Xử lý logic nghiệp vụ
│   ├── models/         # Định nghĩa Schema MongoDB
│   ├── routes/         # Định nghĩa các endpoint API
│   ├── server.js       # File chạy chính
│   └── .env            # Cấu hình môi trường
```

## 💻 Hướng dẫn cài đặt

### 1. Cài đặt Backend
1. Truy cập thư mục backend:
   ```bash
   cd Ticket/backend
   ```
2. Cài đặt thư viện:
   ```bash
   npm install
   ```
3. Cấu hình file `.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ticketbox
   JWT_SECRET=your_secret_key
   SEPAY_SECRET_KEY=your_sepay_key
   BANK_ID=your_bank_id
   BANK_ACCOUNT_NO=your_account_no
   ```
4. Chạy server ở chế độ phát triển:
   ```bash
   npm run dev
   ```

### 2. Kiểm thử API (Thunder Client)
- Import file `api_tests.json` vào Thunder Client của VS Code để sử dụng các mẫu request có sẵn cho Payment và Review.

## 📄 Giấy phép

Dự án này thuộc bản quyền của đội ngũ phát triển TicketBox.
