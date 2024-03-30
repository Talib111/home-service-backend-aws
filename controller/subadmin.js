const Admin = require("../model/v1/Admin");

const bcrypt = require("bcrypt");
const jsonWebToken = require("jsonwebtoken");
const secret = process.env.SECRET;
const { body, validationResult } = require("express-validator");
const Shops = require("../model/v1/Shops");
const Seller = require("../model/v1/Seller");
const Users = require("../model/v1/User");
const ShopConfig = require("../model/v1/ShopConfig");
const { nanoid } = require("nanoid");
const Employee = require("../model/v1/Employee");
const Category = require("../model/v1/Category");
const Package = require("../model/v1/Package");
const Banner = require("../model/v1/Banner");
const Cart = require("../model/v1/Cart");
const Orders = require("../model/v1/Orders");
const User = require("../model/v1/User");
const crypto = require("crypto");
const sendNotification = require("../utils/sendNotification");
const Review = require("../model/v1/Review");
const RefundRequest = require("../model/v1/RefundRequest");
const Notification = require("../model/v1/Notification");

const createCategory = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}

		const { title, subtitle, thumbnail, video, images } = req.body;
		console.log(req.body);
		// Shops.deleteMany({}, () => {});
		// Shops.collection.drop();

		if (!title || !thumbnail) {
			return res.json({
				error: true,
				message: "please provide required fields",
			});
		}
		const nameAlreadyUsed = await Shops.findOne({ title });
		if (nameAlreadyUsed)
			return res.json({
				error: true,
				message: "title is already used, please use another name",
			});

		const category = await new Category({
			title,
			subtitle,
			thumbnail,
			video,
			images,
		}).save();

		if (!category)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			error: false,
			message: "category successfully added",
			payload: category,
		});
	} catch (err) {
		console.error("Error ", err);
		if (err.name == "ValidationError") {
			console.error("Error Validating!", err);
			res.json({
				error: true,
				message: err.message,
			});
		} else {
			console.error(err);
			res.json({
				error: true,
				message: "Something went wrong, please try after some time",
			});
		}
	}
};
const editCategory = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { categoryId } = req.params;
		const { title, subtitle, thumbnail, video, images, sequence, isActive } =
			req.body;
		console.log(req.body);
		// Shops.deleteMany({}, () => {});
		// Shops.collection.drop();

		if (!title || !thumbnail) {
			return res.json({
				error: true,
				message: "please provide required fields",
			});
		}

		const category = await Category.findOneAndUpdate(
			{
				_id: categoryId,
			},
			{
				title,
				subtitle,
				thumbnail,
				video,
				images,
				sequence,
				isActive,
			},
			{
				new: true,
			}
		);

		if (!category)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			error: false,
			message: "category successfully updated",
			payload: category,
		});
	} catch (err) {
		console.error("Error ", err);
		if (err.name == "ValidationError") {
			console.error("Error Validating!", err);
			res.json({
				error: true,
				message: err.message,
			});
		} else {
			console.error(err);
			res.json({
				error: true,
				message: "Something went wrong, please try after some time",
			});
		}
	}
};
const addPackage = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { categoryId } = req.params;
		const {
			title,
			subtitle,
			image,
			duration,
			MRP,
			rating,
			features,
			price,
			gst,
			order,
		} = req.body;
		console.log(req.body);
		// Shops.deleteMany({}, () => {});
		// Shops.collection.drop();

		if (!title || !image) {
			return res.json({
				error: true,
				message: "please provide required fields",
			});
		}

		const package = await new Package({
			title,
			subtitle,
			image,
			duration,
			MRP,
			rating,
			features,
			price,
			gst,
			order,
			category: categoryId,
		}).save();

		const category = await Category.findOneAndUpdate(
			{
				_id: categoryId,
			},
			{
				$push: {
					packages: package._id,
				},
			},
			{
				new: true,
			}
		);

		if (!category || !package)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			error: false,
			message: "package added & category successfully updated",
			payload: category,
		});
	} catch (err) {
		console.error("Error ", err);
		if (err.name == "ValidationError") {
			console.error("Error Validating!", err);
			res.json({
				error: true,
				message: err.message,
			});
		} else {
			console.error(err);
			res.json({
				error: true,
				message: "Something went wrong, please try after some time",
			});
		}
	}
};
const deletePackage = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { categoryId, packageId } = req.params;

		const package = await Package.findOneAndRemove({
			_id: packageId,
		});

		const category = await Category.findOneAndUpdate(
			{
				_id: categoryId,
			},
			{
				$pull: {
					packages: packageId,
				},
			},
			{
				new: true,
			}
		);

		if (!category || !package)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			error: false,
			message: "package removed",
			payload: { category, package },
		});
	} catch (err) {
		console.error("Error ", err);
		if (err.name == "ValidationError") {
			console.error("Error Validating!", err);
			res.json({
				error: true,
				message: err.message,
			});
		} else {
			console.error(err);
			res.json({
				error: true,
				message: "Something went wrong, please try after some time",
			});
		}
	}
};
const editPackage = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { categoryId, packageId } = req.params;
		const {
			title,
			subtitle,
			image,
			duration,
			MRP,
			rating,
			features,
			price,
			gst,
			order,
		} = req.body;
		// console.log(req.body);
		// Shops.deleteMany({}, () => {});
		// Shops.collection.drop();

		if (!title || !image) {
			return res.json({
				error: true,
				message: "please provide required fields",
			});
		}

		const package = await Package.findOneAndUpdate(
			{
				_id: packageId,
			},
			{
				title,
				subtitle,
				image,
				duration,
				MRP,
				rating,
				features,
				price,
				gst,
				order,
			},
			{
				new: true,
			}
		);

		if (!package)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			error: false,
			message: "package added & category successfully updated",
			payload: package,
		});
	} catch (err) {
		console.error("Error ", err);
		if (err.name == "ValidationError") {
			console.error("Error Validating!", err);
			res.json({
				error: true,
				message: err.message,
			});
		} else {
			console.error(err);
			res.json({
				error: true,
				message: "Something went wrong, please try after some time",
			});
		}
	}
};
const updateCustomerDetail = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { id } = req.params;
		const {
			name,
			mobileNumber,
			email,
			image,
			pinCode,
			gender,
			address,
			lat,
			lng,
			landmark,
		} = req.body;

		const customer = await User.findOneAndUpdate(
			{
				_id: id,
			},
			{
				name,
				mobileNumber,
				email,
				userImage: image,
				pinCode,
				gender,
				address,
				landmark,
				location: {
					lat,
					lng,
				},
			},
			{
				new: true,
			}
		);

		if (!customer)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			error: false,
			message: "Success",
			payload: customer,
		});
	} catch (err) {
		console.error("Error ", err);
		if (err.name == "ValidationError") {
			console.error("Error Validating!", err);
			res.json({
				error: true,
				message: err.message,
			});
		} else {
			console.error(err);
			res.json({
				error: true,
				message: "Something went wrong, please try after some time",
			});
		}
	}
};
const getCustomerBookings = async (req, res) => {
	try {
		const { id } = req.params;
		const { page, limit } = req.query;
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

		const orders = await Orders.paginate(
			{
				customerId: id,
			},
			options
		);

		if (!orders)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			error: false,
			message: "All orders",
			payload: orders,
		});
	} catch (err) {
		console.error("Error ", err);
		if (err.name == "ValidationError") {
			console.error("Error Validating!", err);
			res.json({
				error: true,
				message: err.message,
			});
		} else {
			console.error(err);
			res.json({
				error: true,
				message: "Something went wrong, please try after some time",
			});
		}
	}
};

const addBanner = async (req, res) => {
	try {
		const { name, imageURL, url } = req.body;
		const banner = await new Banner({
			name,
			imageURL,
			url,
		}).save();

		return res.json({
			error: false,
			message: "banner Added",
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
const removeBanner = async (req, res) => {
	try {
		const { bannerID } = req.params;
		console.log({ bannerID });
		const banner = await Banner.findOneAndUpdate(
			{
				_id: bannerID,
			},
			{
				isActive: false,
			},
			{ new: true }
		);

		return res.json({
			error: false,
			message: "banner updated",
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
const getAllCartItems = async (req, res) => {
	try {
		const {
			page,
			limit,
			minDate,
			maxDate,
			package,
			category,
			user,
			employee,
			serviceStatus,
			razorpayOrderId,
		} = req.query;
		const options = {
			page: page || 1,
			limit: limit || 10,
			collation: {
				locale: "en",
			},
			sort: {
				createdAt: -1,
			},
		};
		const query = {};
		if (minDate && maxDate) {
			// Both minDate and maxDate are provided, filter for records on the same date
			const minDateObj = new Date(minDate);
			const maxDateObj = new Date(maxDate);

			query.createdAt = {
				$gte: minDateObj.setUTCHours(0, 0, 0, 0),
				$lt: maxDateObj.setUTCHours(24, 0, 0, 0),
			};
		}
		if (package) query.package = package;
		if (category) query.category = category;
		if (user) query.user = user;
		if (employee) query.employee = employee;
		if (serviceStatus) query.serviceStatus = serviceStatus;
		if (razorpayOrderId) query.razorpayOrderId = razorpayOrderId;
		const cartItems = await Cart.paginate(query, options);

		return res.json({
			error: false,
			message: "all cart items",
			payload: cartItems,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: error,
			message: "Something went wrong",
		});
	}
};
const getAllUnAssignedServices = async (req, res) => {
	try {
		const { page, limit } = req.query;
		const options = {
			page: page || 1,
			limit: limit || 10,
			collation: {
				locale: "en",
			},
			sort: {
				createdAt: -1,
			},
		};

		const cartItems = await Cart.paginate(
			{
				serviceStatus: "ORDER CREATED",
				isCompletedToOrder: true,
			},
			options
		);

		return res.json({
			error: false,
			message: "all cart items",
			payload: cartItems,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: error,
			message: "Something went wrong",
		});
	}
};
// const getAllOrders = async (req, res) => {
// 	try {
// 		const {
// 			page,
// 			limit,
// 			minDate,
// 			maxDate,
// 			package,
// 			category,
// 			employee,
// 			orderStatus,
// 			razorpayOrderId,
// 			customerId,
// 			isAllServiceDone,
// 			orderId,
// 			searchQuery,
// 			mobileNumber,
// 			userName,
// 		} = req.query;
// 		const options = {
// 			page: page || 1,
// 			limit: limit || 10,
// 			collation: {
// 				locale: "en",
// 			},
// 			sort: {
// 				createdAt: -1,
// 			},
// 			populate: "customerId",
// 		};

// 		const query = {};
// 		if (minDate && maxDate) {
// 			// Both minDate and maxDate are provided, filter for records on the same date
// 			const minDateObj = new Date(minDate);
// 			const maxDateObj = new Date(maxDate);

// 			query.createdAt = {
// 				$gte: minDateObj.setUTCHours(0, 0, 0, 0),
// 				$lt: maxDateObj.setUTCHours(24, 0, 0, 0),
// 			};
// 		}
// 		if (package) query.package = package;
// 		if (category) query.category = category;
// 		if (customerId) query.customerId = customerId;
// 		if (employee) query.employee = employee;
// 		if (orderStatus) query.orderStatus = orderStatus;
// 		if (razorpayOrderId) query.razorpayOrderId = razorpayOrderId;
// 		if (isAllServiceDone) query.isAllServiceDone = isAllServiceDone;
// 		if (orderId) query.orderId = orderId;
// 		if (mobileNumber) {
// 			const user = await User.findOne({ mobileNumber });
// 			if (!user)
// 				return res.json({
// 					error: true,
// 					message: "No user with provided mobile number",
// 				});
// 			query.customerId = user._id;
// 		}
// 		if (userName) {
// 			const user = await User.findOne({ name: userName });
// 			if (!user)
// 				return res.json({
// 					error: true,
// 					message: "No user with provided mobile number",
// 				});
// 			query.customerId = user._id;
// 		}
// 		if (searchQuery) query["$text"] = { $search: searchQuery };

// 		const orders = await Orders.paginate(query, options);

// 		return res.json({
// 			error: false,
// 			message: "all orders",
// 			payload: orders,
// 		});
// 	} catch (error) {
// 		console.log(error);
// 		return res.json({
// 			error: error,
// 			message: "Something went wrong",
// 		});
// 	}
// };

const getAllOrders = async (req, res) => {
	try {
		const {
			page,
			limit,
			minDate,
			maxDate,
			package,
			category,
			employee,
			orderStatus,
			razorpayOrderId,
			customerId,
			isAllServiceDone,
			orderId,
			searchQuery,
			mobileNumber,
			userName,
		} = req.query;

		console.log('the all order are',page,
		limit,
		minDate,
		maxDate,
		package,
		category,
		employee,
		orderStatus,
		razorpayOrderId,
		customerId,
		isAllServiceDone,
		orderId,
		searchQuery,
		mobileNumber,
		userName)

		const options = {
			page: page || 1,
			limit: limit || 10,
			collation: {
				locale: "en",
			},
			sort: {
				createdAt: -1,
			},
			populate:
				"servicesBooked.cart servicesBooked.package servicesBooked.category customerId",
		};

		const query = {};
		if (minDate && maxDate) {
			// Both minDate and maxDate are provided, filter for records on the same date
			const minDateObj = new Date(minDate);
			const maxDateObj = new Date(maxDate);

			query.createdAt = {
				$gte: minDateObj.setUTCHours(0, 0, 0, 0),
				$lt: maxDateObj.setUTCHours(24, 0, 0, 0),
			};
		}
		if (package) query.package = package;
		if (category) query.category = category;
		if (customerId) query.customerId = customerId;
		if (employee) query.employee = employee;
		if (orderStatus) query.orderStatus = orderStatus;
		if (razorpayOrderId) query.razorpayOrderId = razorpayOrderId;
		if (isAllServiceDone) query.isAllServiceDone = isAllServiceDone;
		if (orderId) query.orderId = orderId;
		if (mobileNumber) {
			const user = await User.findOne({ $text: { $search: mobileNumber } });
			if (!user)
				return res.json({
					error: true,
					message: "No user with provided mobile number",
				});
			query.customerId = user._id;
		}
		if (userName) {
			const user = await User.findOne({ $text: { $search: userName } });
			if (!user)
				return res.json({
					error: true,
					message: "No user with provided name",
				});
			query.customerId = user._id;
		}
		if (searchQuery) query["$text"] = { $search: searchQuery };

		const orders = await Orders.paginate(query, options);

		return res.json({
			error: false,
			message: "all orders",
			payload: orders,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: error,
			message: "Something went wrong",
		});
	}
};

const getAllReviews = async (req, res) => {
	try {
		const {
			page,
			limit,
			minDate,
			maxDate,
			user,
			employeeId,
			packageId,
			categoryId,
			serviceId,
		} = req.query;
		const options = {
			page: page || 1,
			limit: limit || 10,
			collation: {
				locale: "en",
			},
			sort: {
				createdAt: -1,
			},
		};
		const query = {};
		if (minDate && maxDate) {
			// Both minDate and maxDate are provided, filter for records on the same date
			const minDateObj = new Date(minDate);
			const maxDateObj = new Date(maxDate);

			query.createdAt = {
				$gte: minDateObj.setUTCHours(0, 0, 0, 0),
				$lt: maxDateObj.setUTCHours(24, 0, 0, 0),
			};
		}
		if (user) query.user = user;
		if (employeeId) query.employeeId = employeeId;
		if (packageId) query.packageId = packageId;
		if (categoryId) query.categoryId = categoryId;
		if (serviceId) query.serviceId = serviceId;

		const reviews = await Review.paginate(query, options);

		return res.json({
			error: false,
			message: "all reviews",
			payload: reviews,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: error,
			message: "Something went wrong",
		});
	}
};
const getAllRefundRequests = async (req, res) => {
	try {
		const {
			page,
			limit,
			serviceId,
			order,
			service,
			refundAccepted,
			refundAmount,
			refundId,
			refundStatus,
		} = req.query;
		const options = {
			page: page || 1,
			limit: limit || 10,
			collation: {
				locale: "en",
			},
			sort: {
				createdAt: -1,
			},
		};
		const query = {};
		if (serviceId) query.serviceId = serviceId;
		if (order) query.order = order;
		if (service) query.service = service;
		if (refundAccepted) query.refundAccepted = refundAccepted;
		if (refundAmount) query.refundAmount = refundAmount;
		if (refundId) query.refundId = refundId;
		if (refundStatus) query.refundStatus = refundStatus;
		const refundRequests = await RefundRequest.paginate(query, options);

		return res.json({
			error: false,
			message: "all refundRequests",
			payload: refundRequests,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: error,
			message: "Something went wrong",
		});
	}
};

const getAllEmployeeOfCategory = async (req, res) => {
	try {
		const { page, limit } = req.query;
		const options = {
			page: page || 1,
			limit: limit || 10,
			collation: {
				locale: "en",
			},
			sort: {
				createdAt: -1,
			},
		};

		const { id } = req.params;
		const employees = await Employee.paginate(
			{ assignedCategory: id },
			options
		);

		// const list=[]
		// employee
		return res.json({
			error: false,
			message: "all employees assigned to Category",
			payload: employees,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: error,
			message: "Something went wrong",
		});
	}
};
const getOrderDetail = async (req, res) => {
	try {
		const { id } = req.params;

		const orders = await Orders.findOne({ _id: id })
			.populate("servicesBooked.cart servicesBooked.package customerId")
			.populate({
				path: "servicesBooked.cart",
				populate: {
					path: "category",
					model: "category",
				},
			});
		// console.log({ orders });
		const services = orders.servicesBooked;
		const employeeDetail = [];
		for (let i = 0; i < services.length; i++) {
			const element = services[i];
			console.log({ element });
			const employee = element.cart.employee;
			console.log({ employee });
			const admin = await Admin.findOne({ employee: employee })
				.populate("employee")
				.select({
					password: 0,
				});
			employeeDetail.push({
				cart: element.cart._id,
				employee: admin,
			});
		}

		return res.json({
			error: false,
			message: "all orders",
			payload: orders,
			employeeDetail,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: error,
			message: "Something went wrong",
		});
	}
};
const assignEmployeeToOrder = async (req, res) => {
	try {
		const { employeeId, serviceId } = req.body;
		console.log({ employeeId, serviceId });
		const order = await Cart.findOneAndUpdate(
			{
				_id: serviceId,
			},
			{
				employee: employeeId,
				serviceStatus: "EMPLOYEE ASSIGNED",
			},
			{ new: true }
		).populate("user");
		const employee = await Employee.findOneAndUpdate(
			{
				_id: employeeId,
			},
			{
				$push: {
					works: order.serviceId,
				},
			}
		);
		const employeeAdmin = await Admin.findOne({ employee: employeeId });
		console.log({
			employeeAdmin,
		});
		sendNotification(
			employeeAdmin.deviceId,
			"Order Assigned To You",
			`You are assigned to service(#${order.serviceId}) of order(#${order.order}).`,
			employeeAdmin._id
		);
		sendNotification(
			order.user.deviceId,
			"Order Update",
			`${employee.name} assigned to your service(#${order.serviceId}) of order(#${order.order}).`,
			order.user._id
		);
		return res.json({
			error: false,
			message: "Assigned Successfully",
			payload: order,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: error,
			message: "Something went wrong",
		});
	}
};
const unAssignEmployeeToOrder = async (req, res) => {
	try {
		const { serviceId } = req.body;
		console.log({ serviceId });
		const cart = await Cart.findOne({
			_id: serviceId,
		});
		const order = await Cart.findOneAndUpdate(
			{
				_id: serviceId,
			},
			{
				employee: null,
				serviceStatus: "EMPLOYEE REMOVED",
			}
		).populate("user");
		const employee = await Employee.findOneAndUpdate(
			{
				_id: cart.employee,
			},
			{
				$pull: {
					works: cart.serviceId,
				},
			}
		);
		const employeeAdmin = await Admin.findOne({ employee: cart.employee });
		sendNotification(
			employeeAdmin.deviceId,
			"Order Update",
			`You are un-assigned to service(#${order.serviceId}) of order(#${order.order}).`,
			employeeAdmin._id
		);
		// TODO sent notification to employeee
		sendNotification(
			order.user.deviceId,
			"Order Update",
			`removed assigned employee to your service(#${cart.serviceId}) of order(#${order.order}).`,
			order.user._id
		);
		return res.json({
			error: false,
			message: "Removed Successfully",
			payload: order,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: error,
			message: "Something went wrong",
		});
	}
};
const getCustomerDetail = async (req, res) => {
	try {
		const customer = await User.findOne({ _id: req.params.id }).populate(
			"wishlists"
		);
		return res.json({
			error: false,
			message: "Customer Detail",
			payload: customer,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: error,
			message: "Something went wrong",
		});
	}
};
const allUsers = async (req, res) => {
	try {
		const { page, limit, name, mobileNumber } = req.query;
		const options = {
			page: page || 1,
			limit: limit || 10,
			collation: {
				locale: "en",
			},
			sort: {
				createdAt: -1,
			},
		};
		const query = {};
		if (name) query.$text = { $search: name };
		if (mobileNumber) query.$text = { $search: mobileNumber };

		const users = await User.paginate(query, options);

		return res.json({
			error: false,
			message: "All Users",
			payload: users,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: error,
			message: "Something went wrong",
		});
	}
};

const addMorePackageToCart = async (req, res) => {
	try {
		const { packageId, categoryId, selectedDate, selectedTime, mobileNumber } =
			req.body;
		const isAlready = await Cart.findOne({
			mobileNumber,
			package: packageId,
			isCompletedToOrder: false,
		});

		if (isAlready)
			return res.json({
				error: true,
				message:
					"This package in already cart, please first remove from cart to update",
			});
		let profile = await User.findOne({ mobileNumber });
		let package = await Package.findOne({ _id: packageId });
		if (!package.isActive) {
			// const shop = await Shops.findOne({ _id: package.shopId });
			// sendSMSViaTelegram(
			// 	`${shop.chatId}`,
			// 	`${profile.name}(Customer) tried to order ${package.name}, but it is out of stock. Total Item sold are ${product.sold}. Please update the product status in the Dashboard.`
			// );
			return res.json({
				error: true,
				message:
					"Package is Not Available for booking, please check after some time",
			});
		}
		const cart = await new Cart({
			package: package._id,
			user: profile._id,
			category: categoryId,
			selectedDate,
			selectedTime,
			serviceId: crypto.randomInt(10 ** 7, 10 ** 8 - 1),
		}).save();

		if (!cart)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		sendNotification(
			profile.deviceId,
			"Order Update",
			`New Service(#${cart.serviceId}) is added in your order.`,
			profile._id
		);
		return res.json({
			error: false,
			message: "Package added in the cart",
			payload: cart,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};

const registerPlatform = async (req, res) => {
	try {
		const { deviceId, devicePlatform } = req.body;
		const { _id } = req.user;

		const user = await Admin.findOneAndUpdate(
			{
				_id: _id,
			},
			{ deviceId, devicePlatform },
			{ new: true }
		);

		if (user) {
			return res.json({
				error: false,
				message: "updated token successfully",
				// payload: user,
			});
		} else {
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});
		}
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const rescheduleBooking = async (req, res) => {
	try {
		const { selectedDate, selectedTime, cartId } = req.body;
		const cart = await Cart.findOneAndUpdate(
			{
				_id: cartId,
			},
			{
				selectedDate,
				selectedTime,
			}
		);

		if (!cart)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			error: false,
			message: "Updated successfully",
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};

const getNotification = async (req, res) => {
	try {
		const { _id } = req.user;

		let notifications = await Notification.find({
			user: _id,
		}).sort({ updatedAt: "descending" });
		if (!notifications)
			return res.json({
				error: true,
				message: "no notification found",
			});

		return res.json({
			error: false,
			message: "notifications found",
			payload: notifications,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
module.exports = {
	createCategory,
	editCategory,
	addPackage,
	editPackage,
	deletePackage,
	addBanner,
	removeBanner,
	getAllCartItems,
	getAllOrders,
	assignEmployeeToOrder,
	getOrderDetail,
	getCustomerDetail,
	updateCustomerDetail,
	getCustomerBookings,
	getAllEmployeeOfCategory,
	addMorePackageToCart,
	allUsers,
	getAllUnAssignedServices,
	getAllReviews,
	getAllRefundRequests,
	registerPlatform,
	unAssignEmployeeToOrder,
	rescheduleBooking,
	getNotification,
};
