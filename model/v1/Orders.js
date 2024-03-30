const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const OrdersSchema = new Schema(
	{
		orderId: {
			type: String,
			required: true,
		},
		razorpayOrderId: {
			type: String,
		},
		razorpayPaymentId: {
			type: String,
		},
		razorpaySignature: {
			type: String,
		},
		razorpayOrderIdByEmployee: {
			type: String,
		},
		razorpayPaymentIdByEmployee: {
			type: String,
		},
		razorpaySignatureByEmployee: {
			type: String,
		},
		razorpayOrderIdByEmployee: {
			type: String,
		},
		customerId: {
			type: Schema.Types.ObjectId,
			ref: "users",
		},
		employee: {
			type: Schema.Types.ObjectId,
			ref: "employee",
		},
		totalGST: Number,
		amount: Number,
		totalAmount: Number,
		CODAMOUNT: Number,
		paymentStatus: String,
		errorCode: String,
		errorReason: String,
		beforeDiscountAmount: {
			type: Number,
			default: 0,
		},
		discountAmount: {
			type: Number,
			default: 0,
		},
		discountPercentage: {
			type: Number,
			default: 0,
		},
		couponType: {
			type: String,
		},
		isAmountPaid: {
			type: Boolean,
			default: false,
		},
		paymentMode: String,
		isCOD: Boolean,
		orderStatus: {
			type: String,
			default: "ORDER CONFIRM",
		},

		isAllServiceDone: {
			type: Boolean,
			default: false,
		},
		cancelStatus: {
			type: Number,
			default: 0,
		},
		servicesBooked: [
			{
				cart: {
					type: Schema.Types.ObjectId,
					ref: "cart",
				},
				package: {
					type: Schema.Types.ObjectId,
					ref: "packages",
				},
				totalPrice: Number,
				gst: Number,
				price: Number,
				isPaid: {
					//in case of COD
					type: Boolean,
					default: false,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);
OrdersSchema.plugin(mongoosePaginate);
OrdersSchema.index({ "$**": "text" });

module.exports = Orders = mongoose.model("orders", OrdersSchema);

// password and phone for auth
