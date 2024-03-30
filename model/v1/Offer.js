const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OfferSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		subTitle: {
			type: String,
		},
		url: {
			type: String,
		},
		image: String,
		endDate: Date,
		shopId: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: 'shop',
		},
		products: [
			{
				type: mongoose.SchemaTypes.ObjectId,
				ref: 'product',
			},
		],
	},
	{
		timestamps: true,
	}
);

module.exports = Offer = mongoose.model('offer', OfferSchema);

// password and phone for auth
