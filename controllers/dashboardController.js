const Order = require('../models/Order');
const { isInMemory, getStore } = require('../config/db');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
const getDashboardStats = async (req, res) => {
  try {
    if (isInMemory()) {
      const store = getStore();
      const orders = store.orders;

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

      const statusCounts = {
        RECEIVED: orders.filter((o) => o.status === 'RECEIVED').length,
        PROCESSING: orders.filter((o) => o.status === 'PROCESSING').length,
        READY: orders.filter((o) => o.status === 'READY').length,
        DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
      };

      return res.json({ totalOrders, totalRevenue, statusCounts });
    }

    // ─── MongoDB aggregation ───────────────────────────────
    const totalOrders = await Order.countDocuments();

    const revenueAgg = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    const statusAgg = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusCounts = { RECEIVED: 0, PROCESSING: 0, READY: 0, DELIVERED: 0 };
    statusAgg.forEach((s) => {
      if (statusCounts[s._id] !== undefined) statusCounts[s._id] = s.count;
    });

    res.json({ totalOrders, totalRevenue, statusCounts });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
