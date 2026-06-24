const mongoose = require("mongoose");

const offerSchema = mongoose.Schema({
    isActive: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    discountType: {
        type: String,
        required: true,
        enum: ["percentage", "flat"]
    },
    discountValue: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
});

const offerModel = mongoose.model("Offer", offerSchema);
module.exports = offerModel;