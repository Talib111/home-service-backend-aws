const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const TransactionsSchema = new Schema(
	{
		razorpayId: {
			type: String,
		},
		amount: {
			type: Number,
			default: 0,
		},
		serviceIds: {
			type: Array,
		},
		isCOD: {
			type: Boolean,
			default: false,
		},
		isPaid: {
			type: Boolean,
			default: false,
		},
		isVerifiedByEmployee: {
			type: Boolean,
			default: false,
		},
		isCashSubmitted: {
			type: Boolean,
			default: false,
		},
		cashSubmittedDate: Date,
		cashSubmittedBy: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: "admin",
		},
		cashDepositedToEmployee: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: "admin",
		},
		cashAcceptedBy: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: "admin",
		},
		customer: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: "users",
		},
		order: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: "orders",
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		verifiedBy: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: "admin",
		},
		disputeRaisedBy: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: "admin",
		},
		isDispute: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

TransactionsSchema.plugin(mongoosePaginate);

module.exports = Transactions = mongoose.model(
	"transactions",
	TransactionsSchema
);
