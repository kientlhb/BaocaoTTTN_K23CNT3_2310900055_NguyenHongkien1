const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authController = require('./src/controllers/authController');
const apiRoutes = require('./src/routes/api');

const app = express();

app.use(cors());
app.use(express.json());

// API Xác thực
if (authController.login) {
  app.post('/api/auth/login', authController.login);
}
if (authController.sendOtp) {
  app.post('/api/auth/send-otp', authController.sendOtp);
}
if (authController.resetPasswordWithOtp) {
  app.post('/api/auth/reset-password', authController.resetPasswordWithOtp);
}

// Mount api.js vào tiền tố /api
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server Backend chạy tại: http://localhost:${PORT}`);
});