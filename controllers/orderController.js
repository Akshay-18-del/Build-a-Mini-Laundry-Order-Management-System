const Order = require('../models/Order');
const { v4: uuidv4 } = require('uuid');
const { isInMemory, getStore } = require('../config/db');
const {
  calculateGarmentPrices,
  calculateTotalAmount,
  calculateEstimatedDelivery,
} = require('../services/orderService');

// @desc    Create new order
// @route   POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { customerName, phone, garments } = req.body;

    if (!customerName || !phone || !garments || garments.length === 0) {
      return res.status(400).json({ message: 'Please provide customerName, phone, and garments' });
    }

    const garmentsWithPrices = calculateGarmentPrices(garments);
    const totalAmount = calculateTotalAmount(garmentsWithPrices);
    const estimatedDelivery = calculateEstimatedDelivery();
    const orderId = uuidv4();

    if (isInMemory()) {
      const store = getStore();
      const newOrder = {
        _id: 'ord_' + Date.now() + '_' + Math.random().toString(36).substring(7),
        orderId,
        customerName,
        phone,
        garments: garmentsWithPrices,
        totalAmount,
        estimatedDelivery,
        status: 'RECEIVED',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.orders.push(newOrder);
      return res.status(201).json(newOrder);
    }

    const order = new Order({
      orderId,
      customerName,
      phone,
      garments: garmentsWithPrices,
      totalAmount,
      estimatedDelivery,
      status: 'RECEIVED',
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (with filters)
// @route   GET /api/orders
const getAllOrders = async (req, res) => {
  try {
    const { status, customerName, phone, garmentType } = req.query;

    if (isInMemory()) {
      const store = getStore();
      let filtered = [...store.orders];

      if (status) filtered = filtered.filter((o) => o.status === status);
      if (customerName) filtered = filtered.filter((o) => o.customerName.toLowerCase().includes(customerName.toLowerCase()));
      if (phone) filtered = filtered.filter((o) => o.phone.includes(phone));
      if (garmentType) filtered = filtered.filter((o) => o.garments.some((g) => g.type === garmentType));

      // Sort newest first
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(filtered);
    }

    const query = {};
    if (status) query.status = status;
    if (customerName) query.customerName = { $regex: customerName, $options: 'i' };
    if (phone) query.phone = phone;
    if (garmentType) query['garments.type'] = garmentType;

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['RECEIVED', 'PROCESSING', 'READY', 'DELIVERED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    if (isInMemory()) {
      const store = getStore();
      const order = store.orders.find((o) => o._id === req.params.id);
      if (!order) return res.status(404).json({ message: 'Order not found' });

      order.status = status;
      order.updatedAt = new Date();
      return res.json(order);
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getAllOrders, updateOrderStatus };
