const Razorpay = require("razorpay");
const crypto = require("crypto");
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

// 1-: create order for payment
// 2-: capture payment
// 3-: verify signature for payment success event from razorpay webhook
// 4-: refund payment

const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1-: create order for payment
const createOrder = async (req, res) => {
	try {
		const { amount, currency, receipt, payment_capture, serviceId } = req.body;

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
		// if (!profile.employee?.works?.includes(serviceId))
		// 	return res.json({
		// 		error: true,
		// 		message: "You cannot close this service, as it is not assigned to you.",
		// 	});
		const cart = await Cart.findOne({ serviceId });
		const order = await Orders.findOne({ _id: cart.order }).populate(
			"customerId"
		);
		if (cart?.isServiceDone)
			return res.json({
				error: true,
				message: "Service is already completed.",
			});

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
		});
		// if (currentServiceItem.totalPrice !== Number(amount / 100)) {
		// 	return res.json({
		// 		error: true,
		// 		message: `Customer needs to pay Rs. ${currentServiceItem.totalPrice} amount for this service, please ask the same`,
		// 	});
		// }

		// option ================
		const options = {
			amount: amount, // amount in smallest currency unit
			currency: currency || "INR",
			// crypto randomBytes to generate unique order id for each order creation only number
			receipt:
				receipt || `COLIBET-${Math.floor(Math.random() * 1000000000000)}`,

			payment_capture: payment_capture || 1,
		};
		console.log(options);
		const orderData = await razorpay.orders.create(options);
		if (!orderData)
			return res?.status(400).json({
				success: false,
				message: "unable to create order",
			});
		return res?.status(200).json({
			success: true,
			message: "order created successfully",
			payload: orderData,
		});
	} catch (err) {
		console.error("Error ", err);
		if (err.name == "ValidationError") {
			console.error("Error Validating!", err);
			res?.status(400).json({
				success: false,
				message: err.message,
			});
		} else {
			console.error(err);
			res?.status(500).json({
				success: false,
				message: "Something went wrong, please try after some time",
			});
		}
	}
};

// 2-: capture payment
const capturePayment = async (req, res) => {
	try {
		const { paymentId, amount } = req.body;
		const response = await razorpay.payments.capture(paymentId, amount);
		if (!response)
			return res.json({
				success: false,
				message: "unable to capture payment",
			});
		return res.json({
			success: true,
			message: "payment captured successfully",
			payload: response,
		});
	} catch (err) {
		console.error("Error ", err);
		if (err.name == "ValidationError") {
			console.error("Error Validating!", err);
			res.json({
				success: false,
				message: err.message,
			});
		} else {
			console.error(err);
			res.json({
				success: false,
				message: "Something went wrong, please try after some time",
			});
		}
	}
};

// 3-: verify signature for payment success event from razorpay webhook
const verifySignature = async (req, res) => {
	console?.log("verifySignature", JSON?.stringify(req?.body));
	try {
		const hash = crypto
			.createHmac("sha256", "123456789")
			.update(JSON.stringify(req.body))
			.digest("hex");
		console.log(req.headers["x-razorpay-signature"]);
		if (hash === req.headers["x-razorpay-signature"]) {
			console.log("payment success", JSON.stringify(req.body));

			const transaction = await Transactions.findOneAndUpdate(
				{ razorpayId: req.body.payload.payment.entity.order_id },
				{
					isPaid: true,
				}
			);
			console.log("success webhook", transaction);
			res.status(200).json(req.headers["x-razorpay-signature"]);
		} else {
			console.log("payment failed", JSON.stringify(req.body));
			res.status(500).json({ message: "faild" });
		}
	} catch (err) {
		console.error("Error ", err);
		if (err.name == "ValidationError") {
			console.error("Error Validating!", err);
			res.json({
				success: false,
				message: err.message,
			});
		} else {
			console.error(err);
			res.json({
				success: false,
				message: "Something went wrong, please try after some time",
			});
		}
	}
};

// 4-: refund payment
const refundPayment = async (req, res) => {
	try {
		const { paymentId, amount } = req.body;
		const response = await razorpay.payments.refund(paymentId, amount);
		if (!response)
			return res.json({
				success: false,
				message: "unable to refund payment",
			});
		return res.json({
			success: true,
			message: "payment refunded successfully",
			payload: response,
		});
	} catch (err) {
		console.error("Error ", err);
		if (err.name == "ValidationError") {
			console.error("Error Validating!", err);
			res.json({
				success: false,
				message: err.message,
			});
		} else {
			console.error(err);
			res.json({
				success: false,
				message: "Something went wrong, please try after some time",
			});
		}
	}
};

// created by imran
const closeWorkByOnline = async (req, res) => {
	await workCloseFunc({
		req,
		res,
		serviceId: req.params.serviceId,
		isPaid: true,
	});
};

const workCloseFunc = async ({ req, res, serviceId, isPaid }) => {
	try {
		const {
			remarks,
			amount,
			razorpayOrderIdByEmployee,
			razorpayPaymentIdByEmployee,
			razorpaySignatureByEmployee,
		} = req.body;
		// const { serviceId } = req.params;

		console.log("the service id is ", serviceId);
		console.log("the service id is ", req.user?._id);
		const profile = await Admin.findOne({ _id: req.user?._id }).populate(
			"employee"
		);

		const cart = await Cart.findOne({ serviceId });
		const order = await Orders.findOne({ _id: cart.order }).populate(
			"customerId"
		);
		await Orders.findOneAndUpdate(
			{ _id: cart.order },
			{
				paymentStatus: "COMPLETED",
				paymentMode: "ONLINE",
				isCOD: false,
				razorpayOrderIdByEmployee: razorpayOrderIdByEmployee,
				razorpayPaymentIdByEmployee: razorpayPaymentIdByEmployee,
				razorpaySignatureByEmployee: razorpaySignatureByEmployee,
			}
		);

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
				isPaid: isPaid || false,
			}
		);

		// TODO add transaction here

		const transaction = await new Transactions({
			razorpayId: razorpayOrderIdByEmployee,
			amount: amount,
			isCOD: false,
			isPaid: false,
			customer: order.customerId,
			order: order._id,
			cashDepositedToEmployee: profile._id,
			isCashSubmitted: false,
			serviceIds: [serviceId],
		}).save();

		// update transaction

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

		return res.json({
			error: false,
			message: "Service marked as complete.",
			payload: employeeUpdated,
		});

		// //  at the end update order status to "ORDER COMPLETE" if all the service in araay of order is done

		// const currentServiceItem = order.servicesBooked.map(serv)
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};

module.exports = {
	createOrder,
	capturePayment,
	verifySignature,
	refundPayment,
	closeWorkByOnline,
};
