const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const RefundRequestSchema = new Schema(
	{
		serviceId: {
			type: Number,
		},
		order: {
			type: Schema.Types.ObjectId,
			ref: "orders",
		},
		service: {
			type: Schema.Types.ObjectId,
			ref: "cart",
		},
		totalPrice: Number,
		gst: Number,
		price: Number,
		totalOrderPrice: Number,
		refundAcceptedBy: {
			type: Schema.Types.ObjectId,
			ref: "employee",
		},
		isRefunded: {
			type: Boolean,
			default: false,
		},
		refundedAmount: { type: Number, default: 0 },
		remarks: String,
		refundId: String,
		refundStatus: {
			type: String,
			default: "PENDING",
		},
	},
	{
		timestamps: true,
	}
);

RefundRequestSchema.plugin(mongoosePaginate);
RefundRequestSchema.plugin(aggregatePaginate);

module.exports = RefundRequest = mongoose.model(
	"refundrequest",
	RefundRequestSchema
);

// password and phone for auth
