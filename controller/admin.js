const Admin = require("../model/v1/Admin");
const mongoose = require("mongoose");
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
const Transactions = require("../model/v1/Transactions");
const Razorpay = require("razorpay");
const RefundRequest = require("../model/v1/RefundRequest");
const Cart = require("../model/v1/Cart");
const sendNotification = require("../utils/sendNotification");
const globalFunc = require("../utils/funcs");
const Category = require("../model/v1/Category");
const Order = require("../model/v1/Orders");

var instance = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const initiateRefund = async (req, res) => {
	try {
		const { id, amount, remarks } = req.body;

		const refundRequests = await RefundRequest.findOne({
			_id: id,
		}).populate("order service");
		if (amount > refundRequests.totalPrice) {
			return res.json({
				error: true,
				message: `Amount cannot be greater that total price ,ie, ${refundRequests.totalPrice}`,
			});
		}
		if (refundRequests.isRefunded) {
			return res.json({
				error: true,
				message: `Ticket is already closed. Amount Refunded is Rs.${
					refundRequests.refundedAmount / 100
				}`,
			});
		}
		console.table({
			RefundRequestId: id,
			orderId: `${refundRequests.order._id}`,
			serviceId: `${refundRequests.service._id}`,
		});
		const refundResponse = await instance.payments.refund(
			refundRequests.order.razorpayPaymentId,
			{
				amount: Math.round(amount * 100),
				speed: "normal",
				notes: {
					RefundRequestId: id,
					orderId: `${refundRequests.order._id}`,
					serviceId: `${refundRequests.service._id}`,
				},
				receipt: `${refundRequests.service.serviceId}`,
			}
		);
		const cart = await Cart.findOneAndUpdate(
			{
				_id: refundRequests.service._id,
			},
			{
				serviceStatus: "AMOUNT REFUNDED",
			}
		).populate("user");

		console.log({
			refundResponse,
		});
		const refundRequestsUpdate = await RefundRequest.findOneAndUpdate(
			{
				_id: id,
			},
			{
				refundAcceptedBy: req.user._id,
				remarks,
				refundedAmount: Math.round(amount * 100),
				isRefunded: true,
				refundId: refundResponse.id,
				refundStatus: "REFUNDED AMOUNT",
			},
			{ new: true }
		);

		sendNotification(
			cart.user.deviceId,
			"Order Update",
			`Amount Refunded is Rs.${
				refundRequestsUpdate.refundedAmount / 100
			} for your service ${cart.serviceId}`,
			cart.user._id
		);

		return res.json({
			error: false,
			message: "all refund requests",
			payload: refundRequestsUpdate,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: error,
			message: "Something went wrong",
		});
	}
};
const verifyTransaction = async (req, res) => {
	try {
		const { id } = req.body;

		const transaction = await Transactions.findOneAndUpdate(
			{ _id: id },
			{
				isVerified: true,
				verifiedBy: req.user._id,
			}
		);
		if (transaction)
			return res.json({
				error: true,
				message: "Success",
			});
	} catch (error) {
		console.log(error);
		return res.json({
			error: error,
			message: "Something went wrong",
		});
	}
};
const raiseDispute = async (req, res) => {
	try {
		const { id } = req.body;

		const transaction = await Transactions.findOneAndUpdate(
			{ _id: id },
			{
				isDispute: true,
				disputeRaisedBy: req.user._id,
			}
		);
		if (transaction)
			return res.json({
				error: true,
				message: "Success",
			});
	} catch (error) {
		console.log(error);
		return res.json({
			error: error,
			message: "Something went wrong",
		});
	}
};
const acceptCash = async (req, res) => {
	try {
		const { id, employeeId } = req.body;

		const transaction = await Transactions.findOneAndUpdate(
			{ _id: id },
			{
				cashSubmittedBy: employeeId,
				cashAcceptedBy: req.user._id,
				isCashSubmitted: true,
				cashSubmittedDate: new Date(),
			}
		);
		if (!transaction)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			error: false,
			message: "Success",
			payload: transaction,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: error,
			message: "Something went wrong",
		});
	}
};

const signIn = async (req, res) => {
	try {
		// console.log({ body: req.body });
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}

		let { adminId, password, fcmToken } = req.body;
		// mobileNumber = parseInt(mobileNumber);
		// console.log({
		// 	adminId,
		// 	password,
		// });
		if (!adminId || !password) {
			return res.json({
				error: true,
				message: "Incomplete Details",
			});
		}

		const user = await Admin.findOne({ adminId });

		if (!user)
			return res.json({
				error: true,
				message: "User not found",
			});

		// MATCH USER ENRCYPTED PASSWORD
		const isMatched = await bcrypt.compare(password, user.password);
		if (!isMatched)
			return res.json({
				error: true,
				message: "Password does not matched",
			});
		if (user.employee) {
			const employee = await Employee.findOne({ _id: user.employee });
			if (employee.isBanned)
				return res.json({
					error: true,
					message: "You are banned, please contact customer care",
				});
		}
		const adminAfterFCM = await Admin.findOneAndUpdate(
			{
				adminId,
			},
			{
				deviceId: fcmToken,
				deviceType: "WEB_VIEW",
			}
		);

		//PASSWORD MATCHED
		const data = {
			name: user.name,
			adminId: user.adminId,
			_id: user._id,
		};
		// JWT TOKEN SIGN
		const token = jsonWebToken.sign(data, secret, {
			expiresIn: "1d",
		});
		return res.json({
			error: false,
			message: "Signin Successfully",
			token: token,
			payload: {
				name: user.name,
				userImage: user.userImage,
				roles: user.roles,
				role: user.isSuperAdmin
					? "SUPER_ADMIN"
					: user.isEmployee
					? "EMPLOYEE"
					: "ADMIN",
				employeeType: user.employeeType,
				// isSuperAdmin: user.isSuperAdmin,
			},
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};

const createAdmin = async (req, res) => {
	try {
		// console.log({ BODy: req.body });
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}

		const { name, password, adminId } = req.body;
		// console.log(req.body);
		if (!name || !password || !adminId) {
			return res.json({
				error: true,
				message: "please provide all fields",
			});
		}
		const nameAlreadyUsed = await Admin.findOne({ name });
		if (nameAlreadyUsed)
			return res.json({
				error: true,
				message: "name is already used, please use another name",
			});

		const IdAlreadyUsed = await Admin.findOne({ adminId });
		if (IdAlreadyUsed)
			return res.json({
				error: true,
				message: "Admin Id is already used, please use another",
			});

		// NO ACCOUNT FOUND

		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);
		// Admin.deleteMany({}, () => {});
		const newUSer = await new Admin({
			name,
			adminId,
			password: hash,
		}).save();

		if (!newUSer) {
			return res.json({
				error: true,
				message: "Account cannot be created",
			});
		}

		return res.json({
			message: "Account Created successfully",
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Oops, something went wrong",
		});
	}
};
const addEmployee = async (req, res) => {
	try {
		console.log({ BODy: req.body });
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}

		const {
			firstName,
			lastName,
			password,
			userImage,
			city,
			state,
			pinCode,
			description,
			employeeType,
			panFrontImage,
			panBackImage,
			altMobileNumber,
			addhaarCardNumber,
			panCardNumber,
			mobileNumber,
		} = req.body;
		// console.log(req.body);
		if (!firstName || !password) {
			return res.json({
				error: true,
				message: "please provide all fields",
			});
		}
		var format = /\s/;

		if (format.test(firstName)) {
			return res.json({
				error: true,
				message: "First name should not have any special character or space",
			});
		}

		const ID = await globalFunc.customNanoId(5);
		const employeeID = `${firstName}_${ID}`;

		const IdAlreadyUsed = await Admin.findOne({ adminId: employeeID });
		if (IdAlreadyUsed)
			return res.json({
				error: true,
				message: "Admin Id is already used, please try again",
			});

		// NO ACCOUNT FOUND

		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);
		// Admin.deleteMany({}, () => {});
		const newEmployee = await new Employee({
			employeeID: employeeID,
			name: `${firstName} ${lastName}`,
			userImage,
			description,
			workingAddress: {
				city,
				state,
				pinCode,
			},
			panFrontImage,
			panBackImage,
			altMobileNumber,
			addhaarCardNumber,
			panCardNumber,
			mobileNumber,
		}).save();
		const newUSer = await new Admin({
			name: `${firstName} ${lastName}`,
			adminId: employeeID,
			password: hash,
			employee: newEmployee._id,
			isEmployee: true,
			employeeType,
		}).save();

		if (!newUSer || !newEmployee) {
			return res.json({
				error: true,
				message: "Account cannot be created",
			});
		}

		return res.json({
			message: "Account Created successfully",
			payload: {
				employeeID,
			},
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Oops, something went wrong",
		});
	}
};
const updateEmployee = async (req, res) => {
	try {
		const { id } = req.params;
		console.log({ BODy: req.body });
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}

		const {
			firstName,
			lastName,
			userImage,
			city,
			state,
			pinCode,
			description,
			isBanned,
			panFrontImage,
			panBackImage,
			altMobileNumber,
			addhaarCardNumber,
			panCardNumber,
			mobileNumber,
		} = req.body;
		// console.log(req.body);
		if (!firstName || !pinCode) {
			return res.json({
				error: true,
				message: "please provide all fields",
			});
		}

		const employee = await Employee.findOneAndUpdate(
			{
				_id: id,
			},
			{
				isBanned,
				name: `${firstName} ${lastName}`,
				userImage,
				description,
				panFrontImage,
				panBackImage,
				altMobileNumber,
				workingAddress: {
					city,
					state,
					pinCode,
				},
				addhaarCardNumber,
				panCardNumber,
				mobileNumber,
			}
		);
		if (!employee)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			message: "Updated successfully",
			payload: employee,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Oops, something went wrong",
		});
	}
};

const reset = async (req, res) => {
	try {
		const { password } = req.body;

		const { id } = req.params;

		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);

		const updatedAdmin = await Admin.findOneAndUpdate(
			{
				_id: id,
			},
			{
				password: hash,
			},
			{
				new: true,
			}
		);

		if (updatedAdmin)
			return res.json({
				error: false,
				message: "password updated",
				payload: updatedAdmin,
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
const employeePasswordReset = async (req, res) => {
	try {
		const { newPassword, id } = req.body;

		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(newPassword, salt);

		const updatedAdmin = await Admin.findOneAndUpdate(
			{
				adminId: id,
			},
			{
				password: hash,
			},
			{
				new: true,
			}
		);

		if (updatedAdmin)
			return res.json({
				error: false,
				message: "password updated",
				payload: updatedAdmin,
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
const assignEmployeeToCategory = async (req, res) => {
	try {
		// employeeId/:categoryId
		const { employeeId, categoryId } = req.body;

		const employee = await Employee.findOneAndUpdate(
			{
				_id: employeeId,
			},
			{
				$push: {
					assignedCategory: categoryId,
				},
			},
			{
				new: true,
			}
		);

		if (!employee)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			error: false,
			message: "Employee Updated",
			payload: employee,
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
const removeEmployeeToCategory = async (req, res) => {
	try {
		// employeeId/:categoryId
		const { employeeId, categoryId } = req.body;

		const employee = await Employee.findOneAndUpdate(
			{
				_id: employeeId,
			},
			{
				$pull: {
					assignedCategory: categoryId,
				},
			},
			{
				new: true,
			}
		);

		if (!employee)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			error: false,
			message: "Employee Updated",
			payload: employee,
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
const addRole = async (req, res) => {
	try {
		const { adminId, role } = req.body;
		if (!/^[A-Z0-9_]+$/i.test(role)) {
			return res.json({
				error: true,
				message: "Role Need to be uppercase and AlhpaNumber Only",
			});
		}

		const updatedAdmin = await Admin.findOneAndUpdate(
			{
				adminId,
			},
			{ $push: { roles: role } },
			{
				new: true,
			}
		);

		if (!updatedAdmin)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "role updated",
			payload: updatedAdmin,
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
const removeRole = async (req, res) => {
	try {
		const { adminId, role } = req.body;
		if (!/^[A-Z0-9_]+$/i.test(role)) {
			return res.json({
				error: true,
				message: "Role Need to be uppercase and AlhpaNumber Only",
			});
		}
		console.log({ adminId, role });
		const updatedAdmin = await Admin.findOneAndUpdate(
			{
				adminId,
			},
			{ $pull: { roles: role } },
			{
				new: true,
			}
		);

		console.log({ updatedAdmin });

		if (!updatedAdmin)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "role updated",
			payload: updatedAdmin,
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

// TODO eill be deleted below

const createShop = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}

		const {
			name,
			shopName,
			url,
			logo,
			theme,
			websiteTypeHome,
			websiteTypeHeader,
			websiteTypeDetail,
			ownerId,
			customerCareNumber,
			chatId,
			isOnlinePayment,
			stickyText,
			address,
			email,
		} = req.body;
		console.log(req.body);
		// Shops.deleteMany({}, () => {});
		// Shops.collection.drop();

		if (!name || !shopName || !url || !logo || !ownerId) {
			return res.json({
				error: true,
				message: "please provide required fields",
			});
		}
		const nameAlreadyUsed = await Shops.findOne({ name });
		if (nameAlreadyUsed)
			return res.json({
				error: true,
				message: "name is already used, please use another name",
			});

		const shop = await new Shops({
			name: name.trim().toUpperCase(),
			shopName,
			url,
			logo,
			theme,
			websiteType: {
				home: websiteTypeHome,
				header: websiteTypeHeader,
				detail: websiteTypeDetail,
			},
			ownerId,
			showComingSoon: true,
			customerCareNumber,
			chatId,
			isOnlinePayment,
			stickyText,
			address,
			email,
		}).save();
		const shopConfig = await new ShopConfig({
			shopId: shop._id,
			envName: shop.name,
		}).save();

		if (!shop)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			error: false,
			message: "shop successfully added",
			payload: shop,
			shopConfig,
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
const editShop = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { shopId } = req.params;
		const {
			name,
			shopName,
			url,
			logo,
			theme,
			websiteTypeHome,
			websiteTypeHeader,
			websiteTypeDetail,
			ownerId,
			showComingSoon,
			customerCareNumber,
			chatId,
			isOnlinePayment,
			stickyText,
		} = req.body;
		console.log(req.body);
		if (!name || !shopName || !url || !logo || !ownerId) {
			return res.json({
				error: true,
				message: "please provide required fields",
			});
		}

		const shop = await Shops.findOneAndUpdate(
			{
				_id: shopId,
			},
			{
				name: name.trim().toUpperCase(),
				shopName,
				url,
				logo,
				theme,
				websiteType: {
					home: websiteTypeHome,
					header: websiteTypeHeader,
					detail: websiteTypeDetail,
				},
				ownerId,
				showComingSoon,
				customerCareNumber,
				chatId,
				isOnlinePayment,
				stickyText,
			},
			{
				new: true,
			}
		);

		const shopConfig = await new ShopConfig({
			shopId: shop._id,
			envName: shop.name,
		}).save();

		if (!shop)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			error: false,
			message: "shop successfully added",
			payload: shop,
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
const addShopConfig = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { shopId } = req.params;
		const { paymentKey } = req.body;

		const shop = await ShopConfig.findOneAndUpdate(
			{
				_id: shopId,
			},
			{
				paymentKey,
			},
			{
				new: true,
			}
		);

		if (!shop)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			error: false,
			message: "Config successfully added",
			payload: shop,
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
const transferCoinByAdmin = async (req, res) => {
	const { coins } = req.body;

	const { name } = req.params;

	console.log("Coins " + coins);
	console.log("name " + name);
	console.log(req.user);
	// validate that coins exists or not form the req.user
	if (req.user.coins < coins)
		return res.json({
			error: true,
			message: "you don't have this much coin, contact super admin",
		});

	// send first
	const shop = await Shops.findOneAndUpdate(
		{
			name: name,
		},
		{ $inc: { coins: coins } },
		{ new: true }
	);

	if (!shop)
		return res.json({
			error: true,
			message: "Username is not valid!",
		});

	// updating user coin count
	const admin = await Admin.findOneAndUpdate(
		{ _id: req.user._id },
		{ $inc: { coinGiven: coins, coins: -coins } },
		{
			new: true,
		}
	);

	if (!admin)
		return res.json({
			error: true,
			message: "unable to send",
		});

	const updatedHistory = await new CoinHistory({
		fromId: req.user._id,
		toId: shop._id,
		coins: coins,
		fromAfter: admin.coins,
		toAfter: shop.coins,
	}).save();

	// !!! DO NOT COMMENT IT AS IT IS FOR PRODUCTION
	console.log(
		`${coins} coins transfered from ${updatedHistory.fromId} to ${updatedHistory.toId}`
	);
	return res.json({
		error: false,
		message: "transferred coin successfully",
		payload: admin,
	});
};

const createSeller = async (req, res) => {
	try {
		const { name, password, email, plan, phoneNumber, paymentKey } = req.body;

		const phoneNumberAlreadyUsed = await Seller.findOne({ phoneNumber });
		if (phoneNumberAlreadyUsed)
			return res.json({
				error: true,
				message: "phone number is already used, please use another",
			});

		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);
		// Seller.deleteMany({}, () => {});
		// Seller.collection.drop();

		const seller = await new Seller({
			name,
			password: hash,
			email,
			plan: plan.trim().toUpperCase(),
			phoneNumber,
			paymentKey,
		}).save();

		if (!seller)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			error: false,
			message: "Seller added",
			payload: seller,
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
const editSeller = async (req, res) => {
	try {
		const { sellerId } = req.params;
		const { name, password, email, plan, phoneNumber, paymentKey } = req.body;

		const phoneNumberAlreadyUsed = await Seller.findOne({ phoneNumber });
		if (phoneNumberAlreadyUsed)
			return res.json({
				error: true,
				message: "phone number is already used, please use another",
			});

		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);
		// Seller.deleteMany({}, () => {});
		// Seller.collection.drop();

		const seller = await Seller.findOneAndUpdate(
			{
				_id: sellerId,
			},
			{
				name,
				password: hash,
				email,
				plan: plan.trim().toUpperCase(),
				phoneNumber,
				paymentKey,
			},
			{
				new: true,
			}
		);

		if (!seller)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			error: false,
			message: "Seller added",
			payload: seller,
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

const getAllCategory = async (req, res) => {
	try {
		const category = await Category.find({}).sort({
			sequence: 1,
		});
		// .select("title subtitle thumbnail bookings rating isActive sequence");

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

const editPassword = async (req, res) => {
	try {
		const { password } = req.body;

		const { id } = req.params;

		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);

		const updatedShop = await Shops.findOneAndUpdate(
			{
				_id: id,
			},
			{
				password: hash,
			},
			{
				new: true,
			}
		);

		if (updatedShop)
			return res.json({
				error: false,
				message: "password updated",
				payload: updatedShop,
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

const getAllUsers = async (req, res) => {
	try {
		const users = await Users.find();
		return res.json({
			error: false,
			message: "all users",
			payload: users,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Oops, something went wrong",
		});
	}
};
const getAllEmployee = async (req, res) => {
	try {
		const {
			page,
			limit,
			isNoPagination,
			employeeType,
			isEmployee,
			deviceType,
			name,
			adminId,
			mobileNumber,
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
			populate: { path: "employee", model: Employee },
		};
		const queryObj = {
			employee: { $exists: true },
		};

		if (isEmployee) queryObj.isEmployee = isEmployee;
		if (employeeType) queryObj.employeeType = employeeType;
		if (deviceType) queryObj.deviceType = deviceType;
		if (name) queryObj["$text"] = { $search: name };
		if (adminId) queryObj.adminId = adminId;

		// Check if mobileNumber is provided and update the query and options accordingly
		if (mobileNumber) {
			// queryObj.mobileNumber = mobileNumber;
			options.populate = {
				...options.populate,
				match: { mobileNumber: mobileNumber, isBanned: false },
			};
		}

		console.log(options);

		if (isNoPagination) {
			options.pagination = false;
		}

		const employees = await Admin.paginate(queryObj, options);
		console.log({
			employees,
		});
		const afterfilter = employees.docs.filter(
			(employee) => employee.employee.isBanned !== true
		);
		return res.json({
			error: false,
			message: "all employees",
			payload: afterfilter,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Oops, something went wrong",
		});
	}
};
const getAllEmployeeV2 = async (req, res) => {
	try {
		const {
			page,
			limit,
			isNoPagination,
			name,
			pinCode,
			state,
			city,
			workId,
			pastWorkId,
			category,
			isBanned,
			addhaarCardNumber,
			panCardNumber,
			mobileNumber,
			altMobileNumber,
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
		const queryObj = {};

		if (altMobileNumber) queryObj.altMobileNumber = altMobileNumber;
		if (mobileNumber) queryObj.mobileNumber = mobileNumber;
		if (panCardNumber) queryObj.panCardNumber = panCardNumber;
		if (addhaarCardNumber) queryObj.addhaarCardNumber = addhaarCardNumber;
		if (isBanned) queryObj.isBanned = isBanned;
		if (pinCode) queryObj["workingAddress.pinCode"] = pinCode;
		if (city) queryObj["workingAddress.city"] = city;
		if (state) queryObj["workingAddress.state"] = state;
		if (name) queryObj["$text"] = { $search: name };
		if (workId) queryObj["works.$.include"] = workId;
		if (pastWorkId) queryObj["pastWorks.$.include"] = pastWorkId;
		if (category) queryObj["category.$.include"] = category;

		console.log(options);

		if (isNoPagination) {
			options.pagination = false;
		}

		const employees = await Employee.paginate(queryObj, options);
		const updatedDocs = [];
		for (let i = 0; i < employees.docs.length; i++) {
			const e = employees.docs[i];
			const admin = await Admin.findOne({ employee: e._id });
			updatedDocs.push({
				data: e,
				adminData: admin,
			});
		}
		employees.docs = updatedDocs;
		return res.json({
			error: false,
			message: "all employees",
			payload: employees,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Oops, something went wrong",
		});
	}
};
const getSingleEmployee = async (req, res) => {
	try {
		const { id } = req.params;
		const employees = await Employee.findOne({
			_id: id,
		}).populate("assignedCategory ");
		const admin = await Admin.findOne({
			employee: id,
		}).select(
			"name adminId userImage employee employeeType roles createdAt updatedAt"
		);
		return res.json({
			error: false,
			message: "all employees",
			payload: { employees, moreDetail: admin },
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Oops, something went wrong",
		});
	}
};
const getAllTranscation = async (req, res) => {
	try {
		const {
			page,
			limit,
			minDate,
			maxDate,
			razorpayId,
			amount,
			isCOD,
			isPaid,
			cashSubmittedDate,
			cashSubmittedBy,
			cashDepositedToEmployee,
			cashAcceptedBy,
			customer,
			order,
			verifiedBy,
			disputeRaisedBy,
			isDispute,
		} = req.query;
		const options = {
			page: page || 1,
			limit: limit || 10,
			sort: { updatedAt: "descending" },
			populate: {
				path: "customer",
				select: "name mobileNumber email userImage pinCode createdAt updatedAt",
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
		if (razorpayId) query.razorpayId = razorpayId;
		if (amount) query.amount = amount;
		if (isCOD) query.isCOD = isCOD;
		if (isPaid) query.isPaid = isPaid;
		if (cashSubmittedDate) query.cashSubmittedDate = cashSubmittedDate;
		if (cashSubmittedBy) query.cashSubmittedBy = cashSubmittedBy;
		if (cashDepositedToEmployee)
			query.cashDepositedToEmployee = cashDepositedToEmployee;
		if (cashAcceptedBy) query.cashAcceptedBy = cashAcceptedBy;
		if (customer) query.customer = customer;
		if (verifiedBy) query.verifiedBy = verifiedBy;
		if (order) query.order = order;
		if (disputeRaisedBy) query.disputeRaisedBy = disputeRaisedBy;
		if (isDispute) query.isDispute = isDispute;

		const transactions = await Transactions.paginate(query, options);
		return res.json({
			error: false,
			message: "all transactions",
			payload: transactions,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Oops, something went wrong",
		});
	}
};
const getAllTranscationbyEmployee = async (req, res) => {
	try {
		// cashDepositedToEmployee

		const {
			page,
			limit,
			minDate,
			maxDate,
			razorpayId,
			amount,
			isPaid,
			cashSubmittedDate,
			cashSubmittedBy,
			employee,
			cashAcceptedBy,
			customer,
			order,
			verifiedBy,
			disputeRaisedBy,
			isDispute,
		} = req.query;
		const options = {
			page: page || 1,
			limit: limit || 10,
			sort: { updatedAt: "descending" },
			populate: {
				path: "customer",
				select: "name mobileNumber email userImage pinCode createdAt updatedAt",
			},
		};
		const query = {
			isCOD: true,
		};
		if (minDate && maxDate) {
			// Both minDate and maxDate are provided, filter for records on the same date
			const minDateObj = new Date(minDate);
			const maxDateObj = new Date(maxDate);

			query.createdAt = {
				$gte: minDateObj.setUTCHours(0, 0, 0, 0),
				$lt: maxDateObj.setUTCHours(24, 0, 0, 0),
			};
		}
		if (razorpayId) query.razorpayId = razorpayId;
		if (amount) query.amount = amount;
		// if (isCOD) query.isCOD = isCOD;
		if (isPaid) query.isPaid = isPaid;
		if (cashSubmittedDate) query.cashSubmittedDate = cashSubmittedDate;
		if (cashSubmittedBy) query.cashSubmittedBy = cashSubmittedBy;
		if (employee) query.cashDepositedToEmployee = employee;
		if (cashAcceptedBy) query.cashAcceptedBy = cashAcceptedBy;
		if (customer) query.customer = customer;
		if (verifiedBy) query.verifiedBy = verifiedBy;
		if (order) query.order = order;
		if (disputeRaisedBy) query.disputeRaisedBy = disputeRaisedBy;
		if (isDispute) query.isDispute = isDispute;

		const transactions = await Transactions.paginate(query, options);
		return res.json({
			error: false,
			message: "all offline transactions",
			payload: transactions,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Oops, something went wrong",
		});
	}
};
const deleteUser = async (req, res) => {
	try {
		const { userId } = req.params;
		const user = await Users.findOneAndDelete({
			_id: userId,
		});
		return res.json({
			error: false,
			message: "deleted user",
			payload: user,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Oops, something went wrong",
		});
	}
};
const getAllSeller = async (req, res) => {
	try {
		const seller = await Seller.find();
		return res.json({
			error: false,
			message: "all seller",
			payload: seller,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Oops, something went wrong",
		});
	}
};

// get all cart join with order and user and product

const getAllCart = async (req, res) => {
	try {
		const { page, limit } = req.query;
		const options = {
			page: page || 1,
			limit: limit || 10,
			sort: { updatedAt: "descending" },
			populate: {
				path: "user",
				select: "name email mobileNumber userImage",
			},
		};
		const aggregate = [
			{
				$lookup: {
					from: "orders",
					localField: "order",
					foreignField: "_id",
					as: "order",
				},
			},

			{
				$lookup: {
					from: "users",
					localField: "user",
					foreignField: "_id",
					as: "user",
				},
			},
			{
				// package
				$lookup: {
					from: "packages",
					localField: "package",
					foreignField: "_id",
					as: "package",
				},
			},
			{
				$unwind: "$order",
			},

			{
				$unwind: "$user",
			},
			{
				$unwind: "$package",
			},

			// remove user.password from user object and user.password from order object

			{
				$project: {
					"order.user.password": 0,
					"user.password": 0,
				},
			},
		];

		const aggregateData = Cart.aggregate(aggregate);

		const GetCartAggregate = await Cart.aggregatePaginate(
			aggregateData,
			options
		);

		return res.json({
			error: false,
			message: "all cart",
			payload: GetCartAggregate,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Oops, something went wrong",
		});
	}
};

// update cancelStatus by admin using _id

const getRefundList = async (req, res) => {
	try {
		const { page, limit } = req.query;
		const options = {
			page: page || 1,
			limit: limit || 10,
		};
		const aggregate = [
			{
				$sort: {
					// create ascending order
					createdAt: -1,
				},
			},
			{
				$lookup: {
					from: "orders",
					localField: "order",
					foreignField: "_id",
					as: "order",
				},
			},

			{
				$lookup: {
					from: "carts",
					localField: "service",
					foreignField: "_id",
					as: "service",
				},
			},
			// join with  cart package id
			{
				$lookup: {
					from: "packages",
					localField: "service.package",
					foreignField: "_id",
					as: "package",
				},
			},

			{
				$lookup: {
					from: "users",
					localField: "service.user",
					foreignField: "_id",
					as: "user",
				},
			},

			{
				$unwind: "$order",
			},

			{
				$unwind: "$service",
			},

			{
				$unwind: "$package",
			},
			{
				$unwind: "$user",
			},
			{
				$project: {
					_id: 1,
					isRefunded: 1,
					refundedAmount: 1,
					refundedStatus: 1,
					refundReason: 1,
					serviceId: 1,
					totalPrice: 1,
					price: 1,
					gst: 1,
					totalOrderPrice: 1,

					"service._id": 1,
					"service.cancelOrderStatus": 1,
					"service.serviceStatus": 1,
					"service.serviceId": 1,
					"service.selectedDate": 1,
					"service.selectedTime": 1,

					"user.name": 1,
					"user.email": 1,
					"user.mobileNumber": 1,
					"user.userImage": 1,

					"order._id": 1,
					"order.orderId": 1,
					"order.orderStatus": 1,
					"order.customerId": 1,
					"order.paymentMode": 1,
					"order.beforeDiscountAmount": 1,
					"order.discountAmount": 1,
					"order.discountPercentage": 1,
					"order.totalAmount": 1,
					"order.amount": 1,
					"order.isAmountPaid": 1,
					"service.serviceId": 1,

					"package.title": 1,
					"package.price": 1,
					"package.gst": 1,
					"package.totalPrice": 1,
					remark: 1,
					createdAt: 1,
				},
			},

			// remove user.password from user object and user.password from order object
		];

		const aggregateData = RefundRequest.aggregate(aggregate);

		const GetRefundAggregate = await RefundRequest.aggregatePaginate(
			aggregateData,
			options
		);

		return res.json({
			error: false,
			message: "all refund",
			payload: GetRefundAggregate,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Oops, something went wrong",
		});
	}
};

const initiateRefundOffline = async (req, res) => {
	const { id } = req.body;
	try {
		const aggregate = [
			// match with _id

			{
				$match: {
					_id: mongoose.Types.ObjectId(id),
				},
			},

			// order by created at
			{
				$sort: {
					// create ascending order
					createdAt: -1,
				},
			},

			{
				$lookup: {
					from: "orders",
					localField: "order",
					foreignField: "_id",
					as: "order",
				},
			},

			{
				$lookup: {
					from: "carts",
					localField: "service",
					foreignField: "_id",
					as: "service",
				},
			},
			// join with  cart package id
			{
				$lookup: {
					from: "packages",
					localField: "service.package",
					foreignField: "_id",
					as: "package",
				},
			},

			{
				$lookup: {
					from: "users",
					localField: "service.user",
					foreignField: "_id",
					as: "user",
				},
			},

			{
				$unwind: "$order",
			},

			{
				$unwind: "$service",
			},

			{
				$unwind: "$package",
			},
			{
				$unwind: "$user",
			},
			{
				$project: {
					_id: 1,
					isRefunded: 1,
					refundedAmount: 1,
					refundedStatus: 1,
					refundReason: 1,
					serviceId: 1,
					totalPrice: 1,
					price: 1,
					gst: 1,
					totalOrderPrice: 1,

					"service._id": 1,
					"service.cancelOrderStatus": 1,
					"service.serviceStatus": 1,
					"service.serviceId": 1,
					"service.selectedDate": 1,
					"service.selectedTime": 1,

					"user.name": 1,
					"user.email": 1,
					"user.mobileNumber": 1,
					"user.userImage": 1,

					"order._id": 1,
					"order.orderId": 1,
					"order.orderStatus": 1,
					"order.customerId": 1,
					"order.paymentMode": 1,
					"service.serviceId": 1,

					"package.title": 1,
					"package.price": 1,
					"package.gst": 1,
					"package.totalPrice": 1,
					remark: 1,
					createdAt: 1,
				},
			},

			// remove user.password from user object and user.password from order object
		];

		const aggregateData = await RefundRequest.aggregate(aggregate);

		const updatedData = aggregateData[0];

		if (!updatedData)
			return res.json({
				error: true,
				message: "No data found",
			});

		// check if the order is already refunded or not
		if (updatedData.isRefunded)
			return res.json({
				error: true,
				message: "Already refunded",
			});

		const updatedRefund = await RefundRequest.findOneAndUpdate(
			{
				_id: id,
			},
			{
				isRefunded: true,
				refundedAmount: updatedData.totalOrderPrice,
			},
			{
				new: true,
			}
		);

		if (!updatedRefund)
			return res.json({
				error: true,
				message: "No data found",
			});

		const updateCart = await Cart.findOneAndUpdate(
			{
				_id: updatedData.service?._id,
			},
			{
				cancelOrderStatus: 2,
			},
			{
				new: true,
			}
		);

		if (!updateCart)
			return res.json({
				error: true,
				message: "No data found",
			});

		return res.json({
			error: false,
			message: "Successfully refunded",
			payload: aggregateData && aggregateData[0],
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Oops, something went wrong",
		});
	}
};

module.exports = {
	signIn,
	createShop,
	transferCoinByAdmin,
	editPassword,
	reset,
	createAdmin,
	createSeller,
	editShop,
	getAllUsers,
	deleteUser,
	addShopConfig,
	editSeller,
	getAllSeller,
	addRole,
	addEmployee,
	removeRole,
	employeePasswordReset,
	assignEmployeeToCategory,
	removeEmployeeToCategory,
	getAllEmployee,
	updateEmployee,
	getAllTranscation,
	initiateRefund,
	verifyTransaction,
	acceptCash,
	raiseDispute,
	getSingleEmployee,
	getAllTranscationbyEmployee,
	getAllCategory,
	getAllEmployeeV2,
	getAllCart,
	getRefundList,
	initiateRefundOffline,
};
