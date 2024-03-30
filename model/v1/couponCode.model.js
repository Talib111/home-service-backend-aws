const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const CouponCodeSchema = new Schema(
	{
		code: {
			type: String,
			required: true,
		},
		discount: {
			type: Number,
			required: true,
		},
		discountType: {
			type: String,
			default: "percentage",
		},
		status: {
			type: String,
			default: 1,
		},
	},
	{
		timestamps: true,
	}
);

CouponCodeSchema.plugin(aggregatePaginate);

module.exports = CouponCode = mongoose.model("couponCodes", CouponCodeSchema);
