const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Protect all order routes with the auth middleware
router.use(protect);

router.route('/')
  .post(createOrder)
  .get(getAllOrders);

router.route('/:id/status')
  .patch(updateOrderStatus);

module.exports = router;
