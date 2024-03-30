const { randomUUID } = require("crypto");
const Orders = require("../model/v1/Orders");
const Profile = require("../model/v1/Profile");
const Razorpay = require("razorpay");
const Cart = require("../model/v1/Cart");
const crypto = require("crypto");
const Package = require("../model/v1/Package");
const Category = require("../model/v1/Category");
const User = require("../model/v1/User");
const Transactions = require("../model/v1/Transactions");
const Employee = require("../model/v1/Employee");
const RefundRequest = require("../model/v1/RefundRequest");
const couponModel = require("../model/v1/couponCode.model");

var instance = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
	try {
		const discount = req?.query;
		const { authId } = req;
		let profile = await User.findOne({ _id: authId });
		let carts = await Cart.find({
			user: authId,
			isCompletedToOrder: false,
		}).populate("package");

		const coupon = await couponModel
			.findOne({
				code: discount?.couponCode,
				status: "1",
			})
			.select("discount discountType code status");

		if (carts?.length <= 0)
			return res.json({
				error: false,
				message: "Please add some items",
			});
		if (profile.isBanned)
			return res.json({
				error: true,
				message:
					"Your are blocked to make an order, please contact customer care",
			});
		if (!profile.isVerified)
			return res.json({
				error: true,
				message: "Your account is not verified, please verify your account",
			});
		// if (!profile.isProfileComplete)
		// 	return res.json({
		// 		error: true,
		// 		message: "Your account is not complete, please complete your account",
		// 	});
		if (!profile.isActive)
			return res.json({
				error: true,
				message: "Your acount is not active, please contact customer care",
			});

		if (discount?.couponCode && !coupon) {
			return res.json({
				error: true,
				message: "Invalid Input, Please try after sometime",
			});
		}

		let subTotal = 0;
		let totalGST = 0;
		let totalBeforeGST = 0;
		console.log({ carts });
		const servicesBooked = carts.map((cart) => {
			const { package } = cart;
			const gstValue = package.gst || 0;
			const calculatedGST =
				(parseFloat(package.price.toFixed(2)) *
					parseFloat(gstValue.toFixed(2))) /
				100;
			const totalPrice = parseFloat(package.price.toFixed(2)) + calculatedGST;

			totalBeforeGST += parseFloat(package.price.toFixed(2));
			subTotal += totalPrice;
			totalGST += calculatedGST;

			return {
				cart: cart._id,
				package: package._id,
				totalPrice,
				gst: package.gst,
				price: package.price,
			};
		});
		// let total=
		let beforeDiscount = subTotal;
		let discountAmt =
			subTotal -
			(coupon?.discountType === "percentage"
				? (subTotal * coupon?.discount) / 100
				: coupon?.discount || 0);
		const payment_capture = 1,
			receipt = randomUUID();

		const options = {
			amount: parseFloat(discountAmt).toFixed(2) * 100,
			currency: "INR",
			receipt,
			notes: {
				cart: JSON.stringify(carts.map((cart) => cart?._id)),
				beforeDiscountAmount: parseFloat(beforeDiscount.toFixed(2)),
				amount: parseFloat(discountAmt.toFixed(2)),
				discountPercentage:
					coupon?.discountType === "percentage" ? coupon?.discount : 0,
				discountAmount:
					coupon?.discountType === "amount"
						? coupon?.discount
						: parseFloat((beforeDiscount - discountAmt).toFixed(2)),
			},
			payment_capture,
		};
		console.log({ options });

		const response = await instance.orders.create(options);
		console.log(response);

		const profileUpdated = await User.findOneAndUpdate(
			{ _id: authId },
			{
				inProgressOrderID: response.id,
				inProgressReciept: receipt,
			},
			{
				new: true,
			}
		);

		return res.json({
			// orderId: order._id,
			id: response.id,
			currency: response.currency,
			amount: response.amount,
			profile: profileUpdated,
			key_id: process.env.RAZORPAY_KEY_ID,
			isOnlinePayment: true,
			error: false,
			message: "Order Created Successfully",
			cartIds: carts.map((cart) => cart?._id),
			coupon: coupon,
			beforeDiscountAmount: parseFloat(beforeDiscount.toFixed(2)),
			discountPercentage:
				coupon?.discountType === "percentage" ? coupon?.discount : 0,
			amountInRupees: parseFloat(discountAmt.toFixed(2)),
			discountAmount:
				coupon?.discountType === "amount"
					? coupon?.discount
					: parseFloat((beforeDiscount - discountAmt).toFixed(2)),
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const cofirmOrderOffline = async (req, res) => {
	const discount = req?.body;
	try {
		const { authId } = req;
		let profile = await User.findOne({ _id: authId });
		let carts = await Cart.find({
			user: authId,
			isCompletedToOrder: false,
		}).populate("package");

		const coupon = await couponModel.findOne({
			code: discount?.couponCode,
			status: "1",
		});

		if (discount?.couponCode && !coupon) {
			return res.json({
				error: true,
				message: "Invalid Input, Please try after sometime",
			});
		}

		if (!carts)
			return res.json({
				error: false,
				message: "Please add some items",
			});
		if (profile.isBanned)
			return res.json({
				error: true,
				message:
					"Your are blocked to make an order, please contact customer care",
			});
		if (!profile.isVerified)
			return res.json({
				error: true,
				message: "Your account is not verified, please verify your account",
			});
		// if (!profile.isProfileComplete)
		// 	return res.json({
		// 		error: true,
		// 		message: "Your account is not complete, please complete your account",
		// 	});
		if (!profile.isActive)
			return res.json({
				error: true,
				message: "Your acount is not active, please contact customer care",
			});

		let subTotal = 0;
		let totalGST = 0;
		let totalBeforeGST = 0;
		console.log({ carts });
		const servicesBooked = carts.map((cart) => {
			const { package } = cart;
			const gstValue = package.gst || 0;
			const calculatedGST =
				(parseFloat(package.price.toFixed(2)) *
					parseFloat(gstValue.toFixed(2))) /
				100;
			const totalPrice = parseFloat(package.price.toFixed(2)) + calculatedGST;

			totalBeforeGST += parseFloat(package.price.toFixed(2));
			subTotal += totalPrice;
			totalGST += calculatedGST;

			return {
				cart: cart._id,
				package: package._id,
				totalPrice,
				gst: package.gst,
				price: package.price,
			};
		});
		let beforeDiscount = subTotal;
		let discountAmount =
			subTotal -
			(coupon?.discountType === "percentage"
				? (subTotal * coupon?.discount) / 100
				: coupon?.discount || 0);

		const order = await new Orders({
			orderId: crypto.randomInt(10 ** 7, 10 ** 8 - 1),
			razorpayOrderId: null,
			razorpayPaymentId: null,
			razorpaySignature: null,
			customerId: authId,
			isPaid: false,
			beforeDiscountAmount: parseFloat(beforeDiscount.toFixed(2)),
			amount: parseFloat(discountAmount.toFixed(2)),
			discountPercentage:
				coupon?.discountType === "percentage" ? coupon?.discount : 0,
			discountAmount:
				coupon?.discountType === "amount"
					? coupon?.discount
					: parseFloat((beforeDiscount - discountAmount).toFixed(2)),
			totalGST,
			couponType: coupon?.discountType,
			paymentStatus: "PENDING",
			isAmountPaid: false,
			paymentMode: "OFFLINE",
			isCOD: true,
			servicesBooked,
		}).save();
		const profile_updated = await User.findOneAndUpdate(
			{ _id: authId },
			{
				$push: {
					orders: order._id,
				},
				$inc: { bookings: 1 },
			}
		);

		// const products = [];
		carts.forEach(async (singleCart) => {
			const cart = await Cart.findOneAndUpdate(
				{ _id: singleCart._id },
				{
					isCompletedToOrder: true,
					isPaid: false,
					razorpayOrderId: null,
					order: order._id,
					serviceStatus: "ORDER CREATED",
				}
			);
			const package = await Package.findOneAndUpdate(
				{ _id: cart.package },
				{
					$inc: { bookings: 1 },
				}
			);
			const category = await Category.findOneAndUpdate(
				{ _id: cart.category },
				{
					$inc: { bookings: 1 },
				}
			);
		});

		// sendSMSViaTelegram(
		// 	`${order_updated.shopId.chatId}`,
		// 	`You have got One order with Order Id ${order_updated._id}. Amount Paid is Rs. ${order_updated.amountPaid}. Please use Admin panel to see details.`
		// );

		return res.json({
			error: false,
			message: "Order complete",
			payload: order,
			cartCount: 0,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const serverVerify = async (req, res) => {
	try {
		const { authId, profile } = req;

		console.log(req.body);
		const {
			razorpay_order_id,
			razorpay_signature,
			razorpay_payment_id,
			amount,
			id,
			discountAmount,
			discountPercentage,
			beforeDiscountAmount,
		} = req.body;
		const generatedSignature = crypto
			.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
			.update(razorpay_order_id + "|" + razorpay_payment_id)
			.digest("hex");
		const isSignatureValid = generatedSignature == razorpay_signature;

		console.log(generatedSignature, razorpay_signature);

		if (isSignatureValid) {
			console.log("_____________request is legit_________");

			console.log(req.body);

			console.table({
				razorpay_order_id,
				razorpay_payment_id,
				razorpay_signature,
				amount,
				id,
			});
			let carts = await Cart.find({
				user: authId,
				isCompletedToOrder: false,
			}).populate("package");

			let subTotal = 0;
			let totalGST = 0;
			let totalBeforeGST = 0;

			const servicesBooked = carts.map((cart) => {
				const { package } = cart;
				const gstValue = package.gst || 0;
				const calculatedGST =
					(parseFloat(package.price.toFixed(2)) *
						parseFloat(gstValue.toFixed(2))) /
					100;
				const totalPrice = parseFloat(package.price.toFixed(2)) + calculatedGST;

				totalBeforeGST += parseFloat(package.price.toFixed(2));
				subTotal += totalPrice;
				totalGST += calculatedGST;

				return {
					cart: cart._id,
					package: package._id,
					totalPrice,
					gst: package.gst,
					price: package.price,
				};
			});
			const order = await new Orders({
				orderId: id,
				razorpayOrderId: razorpay_order_id,
				razorpayPaymentId: razorpay_payment_id,
				razorpaySignature: razorpay_signature,
				customerId: authId,
				paymentStatus: "COMPLETED",
				isAmountPaid: true,
				// amount: Math.round(subTotal * 100),
				amount: parseFloat(amount),
				totalGST,
				paymentMode: "ONLINE",
				isCOD: false,
				servicesBooked: servicesBooked,
				beforeDiscountAmount: parseFloat(beforeDiscountAmount) || 0,
				discountAmount: parseFloat(discountAmount) || 0,
				discountPercentage: parseFloat(discountPercentage) || 0,
			}).save();
			const profile = await User.findOneAndUpdate(
				{ _id: authId },
				{
					$push: {
						orders: order._id,
					},
					$inc: { bookings: 1 },
				}
			);
			const serviceIds = [];
			// const products = [];
			carts.forEach(async ({ _id }) => {
				const cart = await Cart.findOneAndUpdate(
					{ _id: _id },
					{
						isCompletedToOrder: true,
						isPaid: true,
						razorpayOrderId: razorpay_order_id,
						order: order._id,
						serviceStatus: "ORDER CREATED",
					}
				);
				serviceIds.push(cart.serviceId);
				const package = await Package.findOneAndUpdate(
					{ _id: cart.package },
					{
						$inc: { bookings: 1 },
					}
				);
				const category = await Category.findOneAndUpdate(
					{ _id: cart.category },
					{
						$inc: { bookings: 1 },
					}
				);
			});
			console.log({ profile });

			// TODO sent notification to admin
			// sendSMSViaTelegram(
			// 	`${order_updated.shopId.chatId}`,
			// 	`You have got One order with Order Id ${order_updated._id}. Amount Paid is Rs. ${order_updated.amountPaid}. Please use Admin panel to see details.`
			// );
			const transaction = await new Transactions({
				razorpayId: razorpay_order_id,
				// amount: Math.round(subTotal * 100),
				amount: parseFloat(amount),
				isCOD: false,
				isAmountPaid: true,
				customer: authId,
				order: order._id,
				serviceIds,
			}).save();
			console.log({ transaction });
			return res.json({
				error: false,
				message: "Order complete",
				payload: order,
				cartCount: 0,
			});
		} else {
			return res.json({
				error: true,
				message:
					"Payment Failed, if balance is deduceted, contact customer care",
			});
		}
	} catch (error) {
		console.log({ error });
		// sendSMSViaTelegram(OWNER_CHATID, `WebHook Failed`);
		return res.json({
			error: true,
			message: "Payment Failed, if balance is deduceted, contact customer care",
		});
	}
};
// TODO

const cancelOrder = async (req, res) => {
	try {
		const { authId } = req;
		const { id } = req.params;
		const { serviceId, cancelReason } = req.body; //serviceId will be _id of cart
		console.log({
			serviceId,
			cancelReason,
			id,
		});
		// TODO if status is cancelled then return
		const orders = await Orders.findOne({
			customerId: authId,
			"servicesBooked.cart": serviceId,
			"servicesBooked._id": id,
		});
		if (!orders) {
			return res.json({
				error: true,
				message: "Something went wrong, Please try after sometime",
			});
		}
		const servicesBooked = orders.servicesBooked.find(
			(service) => service._id == id
		);
		console.log({ orders });
		console.log({ servicesBooked1: orders.servicesBooked });
		console.log({ servicesBooked: servicesBooked });
		const isAlreadyCancelled = await Cart.findOne({
			_id: serviceId,
		});
		if (isAlreadyCancelled.serviceStatus === "CANCELLED")
			return res.json({
				error: true,
				message:
					"Service is already cancelled, please contact customer care for any support",
			});
		const finalCancelAmount =
			parseFloat(orders.amount) + parseFloat(orders?.discountAmount);
		const orderAmountReduced = await Orders.findOneAndUpdate(
			{
				customerId: authId,
				"servicesBooked.cart": serviceId,
				"servicesBooked._id": id,
			},
			{
				orderStatus: "SERVICE STATUS UPDATED",
				// amount: Math.round(orders.amount - servicesBooked.totalPrice * 100),
				amount: Math.round(finalCancelAmount - servicesBooked.totalPrice),
			}
		);

		const cart = await Cart.findOneAndUpdate(
			{
				_id: serviceId,
			},
			{
				serviceStatus: "CANCELLED",
				serviceRemarks: cancelReason,
				cancelOrderStatus: 1,
			}
		);
		console.log({ cart });

		const employee = await Employee.findOneAndUpdate(
			{
				_id: cart.employee,
			},
			{
				$pull: { works: cart.serviceId },
				$push: { pastWorks: cart.serviceId },
			}
		);
		// no employee is assigned that is why no update
		console.log({ employee });
		if (!orders.isCOD) {
			const refundRequest = await new RefundRequest({
				serviceId: cart.serviceId,
				order: orders._id,
				service: cart._id,
				totalPrice: servicesBooked.totalPrice,
				price: servicesBooked.price,
				gst: servicesBooked.gst,
				totalOrderPrice: orders.amount,
				remarks: cancelReason,
			}).save();

			console.log({ refundRequest });
			if (refundRequest) {
				return res.json({
					error: false,
					message:
						"Refund request added, amount will refund for this service in 2-4 bussiness days",
				});
			} else {
				return res.json({
					error: true,
					message: "Something wents wrong, Please try after sometime",
				});
			}
		} else {
			return res.json({
				error: false,
				message: "Service cancelled successfully",
			});
		}

		//    1) Create model of Refund Request, then refund using Razorpay of admin verify
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const getAllOrders = async (req, res) => {
	try {
		const { authId } = req;
		const orders = await Orders.find({
			customerId: authId,
		})
			.sort({
				createdAt: -1,
			})
			.populate({
				path: "servicesBooked.cart",
			})
			.populate({
				path: "servicesBooked.package",
				select: `-bookings -order`,
			})
			.populate({
				path: "servicesBooked.cart",
				populate: {
					path: "employee",
					model: "employee",
					select: "name",
				},
			});
		// .populate("servicesBooked servicesBooked.package");
		return res.json({
			error: false,
			message: "all Orders",
			payload: orders,
		});
	} catch (error) {
		console.log(error);
	}
};
const getOrderDetail = async (req, res) => {
	try {
		console.log("DETAIL");
		const { authId } = req;
		const { id } = req.params;
		const orders = await Orders.findOne({
			customerId: authId,
			orderId: id,
		})
			.populate({
				path: "servicesBooked.cart",
			})
			.populate({
				path: "servicesBooked.package",
				select: `-bookings -order`,
			})
			.populate({
				path: "servicesBooked.cart",
				populate: {
					path: "employee",
					model: "employee",
					select: "name",
				},
			});
		// .populate("servicesBooked servicesBooked.package");
		return res.json({
			error: false,
			message: "Order Detail",
			payload: orders,
		});
	} catch (error) {
		console.log(error);
	}
};

// request cancel order
const requestCancelOrder = async (req, res) => {
	try {
		const { authId } = req;
		const { id } = req.params;
		const { serviceId, cancelReason } = req.body; //serviceId will be _id of cart
		console.log({
			serviceId,
			cancelReason,
			id,
		});
		// TODO if status is cancelled then return
		const orders = await Orders.findOne({
			customerId: authId,
			"servicesBooked.cart": serviceId,
			"servicesBooked._id": id,
		});
		if (!orders) {
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});
		}
		const servicesBooked = orders.servicesBooked.find(
			(service) => service._id == id
		);
		console.log({ orders });
		console.log({ servicesBooked1: orders.servicesBooked });
		console.log({ servicesBooked: servicesBooked });
		const isAlreadyCancelled = await Cart.findOne({
			_id: serviceId,
		});
		if (isAlreadyCancelled.serviceStatus === "CANCELLED")
			return res.json({
				error: true,
				message:
					"Service is already cancelled, please contact customer care for any support",
			});

		const orderAmountReduced = await Orders.findOneAndUpdate(
			{
				customerId: authId,
				"servicesBooked.cart": serviceId,
				"servicesBooked._id": id,
			},
			{
				orderStatus: "SERVICE STATUS UPDATED",
				amount: Math.round(orders.amount - servicesBooked.totalPrice * 100),
			}
		);

		const cart = await Cart.findOneAndUpdate(
			{
				_id: serviceId,
			},
			{
				serviceStatus: "CANCELLED",
				serviceRemarks: cancelReason,
			}
		);
		console.log({ cart });

		const employee = await Employee.findOneAndUpdate(
			{
				_id: cart.employee,
			},
			{
				$pull: { works: cart.serviceId },
				$push: { pastWorks: cart.serviceId },
			}
		);
		// no employee is assigned that is why no update
		console.log({ employee });
		if (!orders.isCOD) {
			const refundRequest = await new RefundRequest({
				serviceId: cart.serviceId,
				order: orders._id,
				service: cart._id,
				totalPrice: servicesBooked.totalPrice,
				price: servicesBooked.price,
				gst: servicesBooked.gst,
				totalOrderPrice: orders.amount,
				remarks: cancelReason,
			}).save();

			console.log({ refundRequest });
			if (refundRequest) {
				return res.json({
					error: false,
					message:
						"Refund request added, amount will refund for this service in 2-4 bussiness days",
				});
			} else {
				return res.json({
					error: true,
					message: "Something wents wrong, Please try after sometime",
				});
			}
		} else {
			return res.json({
				error: false,
				message: "Service cancelled successfully",
			});
		}

		//    1) Create model of Refund Request, then refund using Razorpay of admin verify
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
	cancelOrder,
	serverVerify,
	cofirmOrderOffline,
	getAllOrders,
	getOrderDetail,
};
