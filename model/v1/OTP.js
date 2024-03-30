const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const OTPSchema = new Schema(
	{
		// token: {
		// 	type: String,
		// 	required: true,
		// },
		mobileNumber: {
			type: Number,
		},
		otp: {
			type: Number,
		},
		otpVerificationTried: {
			type: Number,
			default: 0,
		},
		expiryTime: {
			type: Date,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = OTP = mongoose.model("OTP", OTPSchema);
