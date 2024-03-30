const Banner = require("../model/v1/Banner");
const Category = require("../model/v1/Category");
const Employee = require("../model/v1/Employee");
const Package = require("../model/v1/Package");

// const addCategory = async (req, res) => {
// 	const { title, subtitle, sampleProductImage } = req.body;
// 	const { shopId } = req.params;
// 	const category = await new Category({
// 		title,
// 		subtitle,
// 		sampleProductImage,
// 		shopId,
// 	}).save();

// 	const shop = await Shops.findOneAndUpdate(
// 		{
// 			_id: shopId,
// 		},
// 		{
// 			$push: {
// 				categories: category?._id,
// 			},
// 		},
// 		{
// 			new: true,
// 		}
// 	);

// 	return res.json({
// 		error: false,
// 		message: 'category added successfully',
// 		payload: category,
// 	});
// };
// const editCategory = async (req, res) => {
// 	const { title, subtitle } = req.body;
// 	const { id } = req.params;

// 	const category = await Category.findOneAndUpdate(
// 		{
// 			_id: id,
// 		},
// 		{
// 			title,
// 			subtitle,
// 		},
// 		{
// 			new: true,
// 		}
// 	);

// 	return res.json({
// 		error: false,
// 		message: 'category updated successfully',
// 		payload: category,
// 	});
// };
// const addProduct = async (req, res) => {
// 	const { productId } = req.body;
// 	const { id } = req.params;
// 	console.log({ productId });

// 	const category = await Category.findOneAndUpdate(
// 		{
// 			_id: id,
// 		},
// 		{
// 			$push: {
// 				products: productId,
// 			},
// 		},
// 		{
// 			new: true,
// 		}
// 	);

// 	return res.json({
// 		error: false,
// 		message: 'category updated successfully',
// 		payload: category,
// 	});
// };
// const removeProduct = async (req, res) => {
// 	const { productId } = req.body;
// 	const { id } = req.params;

// 	const category = await Category.findOneAndUpdate(
// 		{
// 			_id: id,
// 		},
// 		{
// 			$pull: {
// 				products: productId,
// 			},
// 		},
// 		{
// 			new: true,
// 		}
// 	);

// 	return res.json({
// 		error: false,
// 		message: 'category updated successfully',
// 		payload: category,
// 	});
// };
// const removeCategory = async (req, res) => {
// 	const { id, shopId } = req.params;
// 	const category = await Category.findOneAndRemove({
// 		_id: id,
// 	});

// 	const shop = await Shops.findOneAndUpdate(
// 		{
// 			_id: shopId,
// 		},
// 		{
// 			$push: {
// 				categories: id,
// 			},
// 		},
// 		{
// 			new: true,
// 		}
// 	);

// 	return res.json({
// 		error: false,
// 		message: 'category removed successfully',
// 		payload: category,
// 	});
// };

const getAllCategory = async (req, res) => {
	try {
		const category = await Category.find({
			isActive: true,
		})
			.sort({
				sequence: 1,
			})
			.select(
				"title subtitle thumbnail bookings rating isActive sequence createdAt updatedAt"
			);

		return res.json({
			error: false,
			message: "categories found",
			payload: category,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: error,
			message: "Something went wrong",
		});
	}
};
const getCategoryDetail = async (req, res) => {
	try {
		const { id } = req.params;
		const category = await Category.findOne({
			_id: id,
		}).populate("packages reviews");

		return res.json({
			error: false,
			message: "detail found",
			payload: category,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: error,
			message: "Something went wrong",
		});
	}
};
const getEmployeeList = async (req, res) => {
	try {
		const { id } = req.params;
		const employee = await Employee.find({
			assignedCategory: id,
		});

		return res.json({
			error: false,
			message: "list found",
			payload: employee,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: error,
			message: "Something went wrong",
		});
	}
};
const getPopularPackages = async (req, res) => {
	try {
		const packages = await Package.find({
			isActive: true,
		})
			// .sort("bookings")
			.sort({ _id: -1 })
			.limit(10);

		return res.json({
			error: false,
			message: "list found",
			payload: packages,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: error,
			message: "Something went wrong",
		});
	}
};
const getAllPackages = async (req, res) => {
	try {
		const { price, query, page } = req.query;
		const queryObj = {
			isActive: true,
		};
		if (price) queryObj.price = price;

		if (query) queryObj["$text"] = { $search: query };
		const pageNumber = parseInt(page || 1);
		const options = {
			page: pageNumber,
			limit: 30,
			sort: { updatedAt: "descending", createdAt: "descending" },
			populate: "category",
		};
		const packages = await Package.paginate(queryObj, options);

		return res.json({
			error: false,
			message: "list found",
			payload: packages,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: error,
			message: "Something went wrong",
		});
	}
};
const getAllBanners = async (req, res) => {
	try {
		const banner = await Banner.find({
			isActive: true,
		});

		return res.json({
			error: false,
			message: "found",
			payload: banner,
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
	getAllCategory,
	getCategoryDetail,
	getAllBanners,
	getEmployeeList,
	getPopularPackages,
	getAllPackages,
};
