const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const AdminSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		adminId: {
			type: String,
			required: true,
		},
		employee: {
			type: Schema.Types.ObjectId,
			ref: "employee",
		},
		userImage: {
			type: String,
			default:
				"https://d33609liqwio9r.cloudfront.net/2023-08-12T05:59:21.473Z-undraw_Male_avatar_g98d.png",
		},
		altMobileNumber: {
			type: String,
		},
		panFrontImage: {
			type: String,
		},
		panBackImage: {
			type: String,
		},
		isSuperAdmin: {
			type: Boolean,
			default: false,
		},
		isEmployee: {
			type: Boolean,
			default: false,
		},
		employeeType: {
			type: String,
			default: "FIELD_EMPLOYEE",
		},
		roles: [],
		deviceId: String,
		deviceType: {
			type: String,
			default: "WEB",
		},
	},
	{
		timestamps: true,
	}
);
AdminSchema.index({ "$**": "text" });

AdminSchema.plugin(mongoosePaginate);

module.exports = Admin = mongoose.model("admin", AdminSchema);

// password and phone for auth
