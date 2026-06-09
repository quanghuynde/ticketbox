const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

require('./models/Event');
require('./models/Category');
require('./models/Ticket');
require('./models/User');
require('./models/Order');
require('./models/OrderDetail');
require('./models/Payment');
require('./models/Notification');
require('./models/Review');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('TicketBox API is running...');
});

app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));

// Review routes
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

// Payment routes
const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payment', paymentRoutes);

// Database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
