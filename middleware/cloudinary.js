const cloudinary = require('cloudinary').v2;

const setCloudinary = () => {
	cloudinary.config({
		cloud_name: process.env.Cloud_Name,
		api_key: process.env.Api_Key,
		api_secret: process.env.Api_Secret,
	});
};

module.exports = { setCloudinary };
