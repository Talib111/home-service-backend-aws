const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AutoIncrement = require("mongoose-sequence")(mongoose);

const CategorySchema = new Schema(
	{
		title: {
			type: String,
		},
		subtitle: {
			type: String,
		},
		bookings: {
			type: Number,
			default: 0,
		},
		order: {
			type: Number,
			default: 0,
		},
		rating: {
			type: Number,
			default: 5,
		},
		packages: [
			{
				type: mongoose.SchemaTypes.ObjectId,
				ref: "packages",
			},
		],
		// empolyees:[
		// 	{
		// 		type: mongoose.SchemaTypes.ObjectId,
		// 		ref: "employee",
		// 	},
		// ]
		// availableLocations: [
		// 	{
		// 		address: String,
		// 		pinCode: String,
		// 	},
		// ],
		// products: [
		// 	{
		// 		type: mongoose.SchemaTypes.ObjectId,
		// 		ref: "product",
		// 	},
		// ],
		thumbnail: String,
		video: String,
		sequence: Number,
		images: [],
		isActive: {
			type: Boolean,
			default: true,
		},
		reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "review" }],
	},
	{
		timestamps: true,
	}
);

CategorySchema.plugin(AutoIncrement, { inc_field: "sequence" });

module.exports = Category = mongoose.model("category", CategorySchema);

// password and phone for auth
