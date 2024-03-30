const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SellerSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		email: {
			type: String,
		},
		plan: {
			type: String,
		},
		phoneNumber: {
			type: String,
			unique: true,
		},
		paymentKey: String,
	},
	{
		timestamps: true,
	}
);

module.exports = Seller = mongoose.model('seller', SellerSchema);
