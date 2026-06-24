const cron = require("node-cron");
const OfferModel = require("../models/OfferModel");
const ProductModel = require("../models/ProductModel");

const applyDiscountToCategory = async (categoryId, discountType, discountValue) => {
  const filter = categoryId ? { category: categoryId } : {};
  const result = await ProductModel.updateMany(filter, { discount: discountValue, discountType });
  console.log(`✅ Applied ${discountType} ${discountValue} to ${result.nModified} products in category ${categoryId || 'all'}`);
};

const removeDiscountFromCategory = async (categoryId) => {
  const filter = categoryId ? { category: categoryId } : {};
  const result = await ProductModel.updateMany(filter, { discount: 0, discountType: 'percentage' });
  console.log(`✅ Removed discount from ${result.nModified} products in category ${categoryId || 'all'}`);
};

const processOffers = async () => {
  const now = new Date();
  console.log('🔄 Running cron job at', now);

  try {
    // 1️⃣ Active offers (within date range) → apply discount & set isActive = true
    const activeOffers = await OfferModel.find({
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    for (const offer of activeOffers) {
      // Remove any existing discount from the same category (avoid conflicts)
      if (offer.category) {
        await removeDiscountFromCategory(offer.category);
      } else {
        await removeDiscountFromCategory(null);
      }

      // Apply new discount
      await applyDiscountToCategory(offer.category, offer.discountType, offer.discountValue);

      // Ensure isActive = true
      if (!offer.isActive) {
        offer.isActive = true;
        await offer.save();
      }
      console.log(`✅ Applied discount for active offer: ${offer.name}`);
    }

    // 2️⃣ Inactive offers (outside range) → remove discount & set isActive = false
    const inactiveOffers = await OfferModel.find({
      $or: [
        { endDate: { $lt: now } },
        { startDate: { $gt: now } }
      ]
    });

    for (const offer of inactiveOffers) {
      if (offer.category) {
        await removeDiscountFromCategory(offer.category);
      } else {
        await removeDiscountFromCategory(null);
      }

      if (offer.isActive) {
        offer.isActive = false;
        await offer.save();
      }
      console.log(`❌ Removed discount for inactive offer: ${offer.name}`);
    }

  } catch (err) {
    console.error('Cron job error:', err);
  }
};

// Schedule: run every hour
cron.schedule('0 * * * *', processOffers);

module.exports = processOffers;