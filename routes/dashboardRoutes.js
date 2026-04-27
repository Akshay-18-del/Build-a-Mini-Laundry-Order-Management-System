const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Protect dashboard route
router.use(protect);

router.route('/')
  .get(getDashboardStats);

module.exports = router;
