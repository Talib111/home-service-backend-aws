const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const ReviewSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "user",
		},
		employeeId: {
			type: Schema.Types.ObjectId,
			ref: "employee",
		},
		packageId: {
			type: Schema.Types.ObjectId,
			ref: "packages",
		},
		categoryId: {
			type: Schema.Types.ObjectId,
			ref: "category",
		},
		image: String,
		title: String,
		description: String,
		employeeRating: Number,
		serviceRating: Number,
		serviceId: Number,
	},
	{
		timestamps: true,
	}
);
ReviewSchema.plugin(mongoosePaginate);

module.exports = Review = mongoose.model("review", ReviewSchema);

// password and phone for auth
