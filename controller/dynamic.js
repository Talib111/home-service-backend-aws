const DynamicContent = require("../model/v1/DynamicContent");
const Offer = require("../model/v1/Offer");
const Shops = require("../model/v1/Shops");

const addDynamicContent = async (req, res) => {
	const { title, description, subtitle, thumbnail, key, order } = req.body;
	const dynamicData = await new DynamicContent({
		title,
		description,
		subtitle,
		thumbnail,
		key,
		order,
	}).save();

	return res.json({
		error: false,
		message: " added successfully",
		payload: dynamicData,
	});
};
const editDynamicContent = async (req, res) => {
	const { title, description, subtitle, thumbnail, key, order } = req.body;
	const { id } = req.params;

	const dynamicData = await DynamicContent.findOneAndUpdate(
		{
			_id: id,
		},
		{
			title,
			description,
			subtitle,
			thumbnail,
			key,
			order,
		},
		{
			new: true,
		}
	);

	return res.json({
		error: false,
		message: "updated successfully",
		payload: dynamicData,
	});
};

const removeData = async (req, res) => {
	const { id } = req.params;
	const offer = await DynamicContent.findOneAndRemove({
		_id: id,
	});

	return res.json({
		error: false,
		message: "removed successfully",
	});
};

const fetchData = async (req, res) => {
	try {
		const { page, limit, key } = req.query;
		const options = {
			page: page || 1,
			limit: limit || 10,
			collation: {
				locale: "en",
			},
			sort: {
				createdAt: -1,
			},
			populate: "servicesBooked.cart servicesBooked.package",
		};
		const query = {};
		if (key) query.key = key;

		const data = await DynamicContent.paginate(query, options);
		return res.json({
			error: false,
			message: "data found",
			payload: data,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: error,
			message: "Something went wrong",
		});
	}
};

module.exports = {
	addDynamicContent,
	removeData,
	editDynamicContent,
	fetchData,
};
