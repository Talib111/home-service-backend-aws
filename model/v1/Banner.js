const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BannerSchema = new Schema(
	{
		name: {
			type: String,
		},
		imageURL: {
			type: String,
		},
		url: {
			//navigation URL
			type: String,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = Banner = mongoose.model("banners", BannerSchema);

// defaultRole
// 0 - Banner
// 10 => Admin
