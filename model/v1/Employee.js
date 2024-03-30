const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const EmployeeSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		rating: {
			type: Number,
			default: 5,
		},
		userImage: {
			type: String,
			default:
				"https://d33609liqwio9r.cloudfront.net/2023-08-12T05:59:21.473Z-undraw_Male_avatar_g98d.png",
		},
		workingAddress: {
			city: String,
			state: String,
			pinCode: Number,
		},
		works: [
			{
				type: Number,
				required: true,
			},
		],
		pastWorks: [
			{
				type: Number,
				required: true,
			},
		],
		assignedCategory: [
			{
				type: mongoose.SchemaTypes.ObjectId,
				ref: "category",
			},
		],
		isBanned: {
			type: Boolean,
			default: false,
		},
		panFrontImage: String,
		panBackImage: String,
		addhaarCardNumber: String,
		panCardNumber: String,
		mobileNumber: Number,
		altMobileNumber: Number,
		reviews: [],
	},
	{
		timestamps: true,
	}
);

EmployeeSchema.plugin(mongoosePaginate);
EmployeeSchema.index({ "$**": "text" });

module.exports = Employee = mongoose.model("employee", EmployeeSchema);

// password and phone for auth
