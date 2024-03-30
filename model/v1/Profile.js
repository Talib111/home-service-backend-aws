const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfileSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			unique: true,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = Profile = mongoose.model('profile', ProfileSchema);

// password and phone for auth
