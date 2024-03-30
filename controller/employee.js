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
const Transactions = require("../model/v1/Transactions");
const sendNotification = require("../utils/sendNotification");
const { isEmptyObject } = require("../utils/funcs");
const sendGmail = require("../utils/gmail");

const resetPassword = async (req, res) => {
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
		const { _id } = req.user;
		let { password, newPassword } = req.body;
		// mobileNumber = parseInt(mobileNumber);
		// console.log({
		// 	adminId,
		// 	password,
		// });
		if (!newPassword || !password) {
			return res.json({
				error: true,
				message: "Incomplete Details",
			});
		}

		const user = await Admin.findOne({ _id });

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

		// TODO reset

		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(newPassword, salt);
		const updateEmployee = await Admin.findOneAndUpdate(
			{
				_id,
			},
			{
				password: hash,
			}
		);
		if (!updateEmployee)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			error: false,
			message: "Password reset, please signin again",
		});
		// //PASSWORD MATCHED
		// const data = {
		// 	name: updateEmployee.name,
		// 	adminId: updateEmployee.adminId,
		// 	_id: updateEmployee._id,
		// 	role: "employee",
		// };
		// // JWT TOKEN SIGN
		// const token = jsonWebToken.sign(data, secret, {
		// 	expiresIn: "1d",
		// });
		// return res.json({
		// 	error: false,
		// 	message: "Signin Successfully",
		// 	token: token,
		// 	payload: {
		// 		roles: updateEmployee.roles,
		// 		employee: updateEmployee.employee,
		// 	},
		// });
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};

const employeeProfile = async (req, res) => {
	try {
		const profile = await Admin.findOne({ _id: req.user._id }).populate(
			"employee"
		);

		if (!profile)
			return res.json({
				error: true,
				message: "Profile not found",
			});
		return res.json({
			error: false,
			message: "Profile Found",
			payload: profile,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const employeeBookingList = async (req, res) => {
	try {
		const profile = await Admin.findOne({ _id: req.user._id }).populate(
			"employee"
		);

		if (isEmptyObject(profile.employee))
			return res.json({
				error: true,
				message: "You are not an employee",
			});
		if (profile.employee?.works?.length < 1)
			return res.json({
				error: true,
				message: "No work assigned till now.",
			});
		let workHistory = [];
		for (const serviceId of profile.employee?.works) {
			const cart = await Cart.findOne({ serviceId }).populate("package");
			workHistory.push(cart);
		}

		workHistory = workHistory.sort(function (a, b) {
			return new Date(b.selectedDate) - new Date(a.selectedDate);
		});

		if (!workHistory)
			return res.json({
				error: true,
				message: "Work History not found",
			});
		return res.json({
			error: false,
			message: "Work History Found",
			payload: workHistory,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const employeePastWorks = async (req, res) => {
	try {
		const profile = await Admin.findOne({ _id: req.user._id }).populate(
			"employee"
		);
		if (isEmptyObject(profile.employee))
			return res.json({
				error: true,
				message: "You are not an employee",
			});
		if (profile.employee?.pastWorks?.length < 1)
			return res.json({
				error: true,
				message: "No past works",
			});
		let workHistory = [];
		for (const serviceId of profile.employee?.pastWorks) {
			const cart = await Cart.findOne({ serviceId }).populate("package");
			workHistory.push(cart);
		}

		workHistory = workHistory.sort(function (a, b) {
			return new Date(b.selectedDate) - new Date(a.selectedDate);
		});

		if (!workHistory)
			return res.json({
				error: true,
				message: "Work History not found",
			});
		return res.json({
			error: false,
			message: "Work History Found",
			payload: workHistory,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const closeWork = async (req, res) => {
	try {
		const { remarks, amount } = req.body;
		const { serviceId } = req.params;
		console.log("the service id is ", serviceId);
		const profile = await Admin.findOne({ _id: req.user._id }).populate(
			"employee"
		);
		console.log({ profile });
		if (profile.employee?.works?.length < 1)
			return res.json({
				error: true,
				message: "No work assigned till now.",
			});
		if (!profile.employee?.works?.includes(serviceId))
			return res.json({
				error: true,
				message: "You cannot close this service, as it is not assigned to you.",
			});
		const cart = await Cart.findOne({ serviceId }).populate("package");
		const order = await Orders.findOne({ _id: cart.order }).populate(
			"customerId"
		);
		console.log({ cart });
		console.log({ order });
		if (cart.isServiceDone)
			return res.json({
				error: true,
				message: "Service is already completed.",
			});
		if (!order.isCOD) {
			//  online order
			if (
				!order.razorpayOrderId ||
				!order.razorpayPaymentId ||
				!order.razorpaySignature
			) {
				return res.json({
					error: true,
					message:
						"Razorpay details are not present, please contact customer care",
				});
			}

			// all fine
			const cart_update = await Cart.findOneAndUpdate(
				{ serviceId },
				{
					isServiceDone: true,
					serviceStatus: "SERVICE DONE",
					serviceRemarks: remarks,
				}
			);
		} else {
			// COD here payment logic
			const currentServiceItemArray = order.servicesBooked.filter((service) => {
				return cart._id.equals(service.cart);
			});
			if (currentServiceItemArray.length < 1)
				return res.json({
					error: true,
					message: "No items in list",
				});
			const currentServiceItem = currentServiceItemArray[0];
			console.log({
				currentServiceItem,
				amount,
				priceFromDb: currentServiceItem.totalPrice,
				asd: parseFloat(currentServiceItem.totalPrice).toFixed(0),
				asdasdasdasd: parseFloat(Number(amount / 100)).toFixed(0),
			});
			if (
				parseFloat(currentServiceItem.totalPrice).toFixed(0) !==
				parseFloat(Number(amount / 100)).toFixed(0)
			) {
				return res.json({
					error: true,
					message: `Customer needs to pay Rs. ${parseFloat(
						currentServiceItem.totalPrice
					).toFixed(0)} amount for this service, please ask the same`,
					payload: {
						expectedAmount: parseFloat(currentServiceItem.totalPrice).toFixed(
							0
						),
						receivedAmount: parseFloat(Number(amount / 100)).toFixed(0),
					},
				});
			} else {
				// amount matched, close service
				const cart_update = await Cart.findOneAndUpdate(
					{ serviceId },
					{
						isServiceDone: true,
						serviceStatus: "SERVICE DONE",
						serviceRemarks: remarks,
					}
				);
				const order_update = await Orders.findOneAndUpdate(
					{ _id: order._id, "servicesBooked.cart": cart._id },
					{
						isPaid: true,
					}
				);

				// TODO add transaction here

				const transaction = await new Transactions({
					amount: amount,
					isCOD: true,
					isPaid: true,
					customer: order.customerId,
					order: order._id,
					cashDepositedToEmployee: profile._id,
					isCashSubmitted: false,
					serviceIds: [serviceId],
				}).save();
			}
		}
		// //  at the end update order status to "ORDER COMPLETE" if all the service in araay of order is done

		// const currentServiceItem = order.servicesBooked.map(serv)
		const employeeUpdated = await Employee.findOneAndUpdate(
			{
				_id: profile.employee,
			},
			{
				$pull: {
					works: serviceId,
				},
				$push: {
					pastWorks: serviceId,
				},
			}
		);
		const admin = await Admin.findOne({
			employee: profile.employee,
		});
		sendNotification(
			admin.deviceId,
			"Service Update",
			`Service(#${cart.serviceId}) is closed.`,
			admin._id
		);
		sendNotification(
			order.customerId.deviceId,
			"Service Update",
			`Service(#${cart.serviceId}) is closed by employee. Please rate your service`,
			order.customerId._id
		);

		sendGmail({
			orderId: order.orderId,
			serviceId: cart.serviceId,
			customerEmail: order.customerId.email,
			customerName: order.customerId.name,
			packageName: cart.package.title,
			packagePrice: cart.package.price,
			// extraData: order.servicesBooked.map((booked) => ({
			// 	totalPrice: booked.totalPrice,
			// 	paymentMode: "online",
			// })),
		});

		return res.json({
			error: false,
			message: "Service marked as complete.",
			payload: employeeUpdated,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};

const reassignWork = async (req, res) => {
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
		const employeePull = await Employee.findOneAndUpdate(
			{
				_id: req.user._id,
			},
			{
				$pull: {
					works: order.serviceId,
				},
			}
		);
		console.log({ employee });
		// TODO sent notification to employeee
		// sendNotification(
		// 	order.user.deviceId,
		// 	"Order Update",
		// 	`${employee.name} assigned to your service(#${order.serviceId}) of order(#${order.order}).`,
		// 	order.user._id
		// );
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

module.exports = {
	// signIn,
	employeeProfile,
	employeeBookingList,
	closeWork,
	employeePastWorks,
	resetPassword,
	reassignWork,
};
