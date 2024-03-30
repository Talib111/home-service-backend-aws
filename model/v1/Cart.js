const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const CartSchema = new Schema(
	{
		package: {
			type: Schema.Types.ObjectId,
			ref: "packages",
		},
		category: {
			type: Schema.Types.ObjectId,
			ref: "category",
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: "users",
		},
		order: {
			type: Schema.Types.ObjectId,
			ref: "orders",
		},
		quantity: Number,
		serviceId: Number,
		selectedDate: Date,
		selectedTime: String,
		isEmployeeSelectedByUser: Boolean,
		employee: {
			type: Schema.Types.ObjectId,
			ref: "employee",
		},
		serviceRemarks: String,
		isPaid: {
			type: Boolean,
			default: false,
		},
		isServiceDone: {
			type: Boolean,
			default: false,
		},
		serviceStatus: {
			type: String,
			default: "PENDING", // EMPLOYEE ASSIGNED
		},
		isCompletedToOrder: {
			type: Boolean,
			default: false,
		},
		razorpayOrderId: String,
		cancelOrderStatus: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

CartSchema.plugin(mongoosePaginate);
CartSchema.plugin(aggregatePaginate);

module.exports = Cart = mongoose.model("cart", CartSchema);

// password and phone for auth
