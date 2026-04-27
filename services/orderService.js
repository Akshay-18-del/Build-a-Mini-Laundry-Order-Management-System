const PRICE_LIST = {
  Shirt: 50,
  Pants: 80,
  Saree: 100,
};

const calculateGarmentPrices = (garments) => {
  return garments.map((garment) => {
    const pricePerItem = PRICE_LIST[garment.type] || 0;
    return {
      ...garment,
      price: pricePerItem * garment.quantity,
    };
  });
};

const calculateTotalAmount = (garmentsWithPrices) => {
  return garmentsWithPrices.reduce((total, garment) => total + garment.price, 0);
};

const calculateEstimatedDelivery = () => {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 2); // Current date + 2 days
  return deliveryDate;
};

module.exports = {
  PRICE_LIST,
  calculateGarmentPrices,
  calculateTotalAmount,
  calculateEstimatedDelivery,
};
