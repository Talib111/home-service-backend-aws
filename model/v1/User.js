const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2");

const UserSchema = new Schema(
	{
		name: {
			type: String,
		},
		mobileNumber: {
			type: String,
		},
		landmark: {
			type: String,
		},
		email: String,
		userImage: {
			type: String,
			default:
				"https://d33609liqwio9r.cloudfront.net/2023-08-12T05:59:21.473Z-undraw_Male_avatar_g98d.png",
		},
		pinCode: Number,
		gender: String,
		address: String,
		location: {
			lat: Number,
			lng: Number,
		},
		bookings: {
			type: Number,
			default: 0,
		},
		wishlists: [
			{
				type: Schema.Types.ObjectId,
				ref: "packages",
			},
		],
		password: String,
		// orders: [
		// 	{
		// 		type: Schema.Types.ObjectId,
		// 		ref: "orders",
		// 	},
		// ],
		inProgressOrderID: {
			type: String,
		},
		inProgressReciept: {
			type: String,
		},
		// cart: [
		// 	{
		// 		type: Schema.Types.ObjectId,
		// 		ref: "cart",
		// 	},
		// ],
		deviceId: String,
		deviceType: {
			type: String,
			default: "ANDROID",
		},
		//will have the status of the account
		// if the account is created and not veriied then it will be false
		isActive: {
			type: Boolean,
			default: false,
		},
		isProfileComplete: {
			type: Boolean,
			default: false,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		isBanned: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

UserSchema.plugin(mongoosePaginate);
UserSchema.index({ "$**": "text" });

module.exports = User = mongoose.model("users", UserSchema);

// defaultRole
// 0 - User
// 10 => Admin
