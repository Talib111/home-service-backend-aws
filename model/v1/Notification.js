const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
	{
		title: {
			type: String,
		},
		body: {
			type: String,
		},
		url: {
			type: String,
		},
		user: {
			type: Schema.Types.ObjectId,
		},
		tokenId: String,
	},
	{
		timestamps: true,
	}
);

module.exports = Notification = mongoose.model(
	"notification",
	NotificationSchema
);

// password and phone for auth
