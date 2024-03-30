const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const ProductSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		shopId: {
			type: Schema.Types.ObjectId,
			ref: 'shop',
		},
		stock: Number,
		sold: Number,
		lastSoldDate: Date,
		variant: [
			{
				name: String,
				library: [
					{
						key: String,
						product: {
							type: Schema.Types.ObjectId,
							ref: 'product',
						},
					},
				],
			},
		],
		attribute: [
			{
				name: String,
				library: [
					{
						key: String,
						aditionalPrice: Number,
						isAvailable: Boolean,
					},
				],
			},
		],
		availableOn: Date,
		availableTill: Date,
		features: Array,
		mrp: Number,
		discount: Number,
		quickFeatures: [
			{
				key: String,
				value: String,
			},
		],
		maxOrderQuantity: Number,
		images: Array,
		isLimitedEdition: Boolean,
		isFeatured: Boolean,
		isNewProduct: Boolean,
		isOnSale: Boolean,
		// Not done...
		reviews: [
			{
				review: {
					type: Schema.Types.ObjectId,
					ref: 'review',
				},
				isApproved: {
					type: Boolean,
					default: false,
				},
				count: Number,
			},
		],
		averageRating: Number,
		similarProducts: [
			{
				type: Schema.Types.ObjectId,
				ref: 'products',
			},
		],
		categoryId: {
			type: Schema.Types.ObjectId,
			ref: 'category',
		},
		isCodEnabled: Boolean,
		isOnlinePaymentEnabled: Boolean,
		isBuyOnWhatsAppEnabled: Boolean,
		isPickupAvailable: Boolean,
		pickUpDiscount: Number,
		deliveryCharge: Number,
		isPrepaidBeforeCod: Boolean,
		prepaidBeforeCodAmount: Number,

		// Logically...
		inCarts: [
			{
				type: Schema.Types.ObjectId,
				ref: 'users',
			},
		],
	},
	{
		timestamps: true,
	}
);

ProductSchema.index({ '$**': 'text' });
ProductSchema.plugin(mongoosePaginate);

// ProductSchema.virtual('averageRating').get(function () {
// 	let ratings = [];
// 	this.reviews.forEach((review) => ratings.push(review.count));
// 	return (ratings.reduce((a, b) => a + b) / ratings.length).toFixed(2);
// });

module.exports = Product = mongoose.model('product', ProductSchema);
