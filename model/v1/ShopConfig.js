const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShopConfigSchema = new Schema(
	{
		shopId: {
			type: Schema.Types.ObjectId,
			ref: 'shop',
		},
		envName: String,
		paymentKey: String,
		razorpayKeyId: String,
		razorpayKeySecret: String,
		razorpayWebHookSecret: String,
		// GST: Number,
		users: [
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

module.exports = ShopConfig = mongoose.model('shopconfig', ShopConfigSchema);

// password and phone for auth
