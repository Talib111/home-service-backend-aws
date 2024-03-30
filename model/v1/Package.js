const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const PackageSchema = new Schema(
	{
		title: {
			type: String,
		},
		subtitle: {
			type: String,
		},

		image: {
			type: String,
		},
		duration: {
			type: Number, //approximate service time (in mins)
		},
		MRP: {
			type: Number,
		},
		price: {
			type: Number,
		},
		gst: {
			type: Number,
		},
		rating: {
			type: Number,
			default: 5,
		},
		order: {
			type: Number,
			default: 0,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		features: [
			{
				type: String,
			},
		],
		bookings: {
			type: Number,
			default: 0,
		},
		category: {
			type: Schema.Types.ObjectId,
			ref: "category",
		},
		reviews: [],
		// reviews: [
		// 	{
		// 		rating: Number,
		// 		reviewId: {
		// 			type: Schema.Types.ObjectId,
		// 			ref: "review",
		// 		},
		// 	},
		// ],
	},
	{
		timestamps: true,
	}
);

PackageSchema.plugin(mongoosePaginate);
PackageSchema.index({ "$**": "text" });

module.exports = Package = mongoose.model("packages", PackageSchema);
