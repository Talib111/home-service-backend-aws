const AWS = require("aws-sdk");
const { default: axios } = require("axios");
const s3 = new AWS.S3();
const CDN_URL = "https://d33609liqwio9r.cloudfront.net";
const uploadProductImage = async (req, res) => {
	console.log(req.body);
	console.log(req.file);
	// console.log(req);

	if (req.file) {
		return res.json({
			error: false,
			message: "image uploaded to s3",
			payload: {
				url: req.file.location,
				key: encodeURI(req.file.key),
				full_url: CDN_URL + "/" + encodeURI(req.file.key),
			},
		});
	} else {
		return res.json({
			error: true,
			message: "unable to upload image",
		});
	}
};
const uploadProductImageMultiple = async (req, res) => {
	// console.log({ BODY: req });
	console.log({ BODFILEY: req.files });
	console.log(req.files);
	const full_urls = [];
	const urls = [];
	const keys = [];
	req.files.map((file) => {
		// console.log('file');
		// console.log(file);
		full_urls.push(CDN_URL + "/" + encodeURI(file.key));
		urls.push(file.location);
		keys.push(encodeURI(file.key));
	});

	return res.json({
		error: false,
		message: "image uploaded to s3",
		payload: {
			urls,
			full_urls,
			keys,
		},
	});
};

module.exports = {
	uploadProductImage,
	uploadProductImageMultiple,
};
