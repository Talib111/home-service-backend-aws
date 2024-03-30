const Product = require("../model/v1/Product");
const User = require("../model/v1/User");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const crypto = require("crypto");

const Review = require("../model/v1/Review");
const Razorpay = require("razorpay");
const Orders = require("../model/v1/Orders");
const Shops = require("../model/v1/Shops");
const { OWNER_CHATID } = require("../utils/constants");
const ShopConfig = require("../model/v1/ShopConfig");
const Package = require("../model/v1/Package");
const Cart = require("../model/v1/Cart");
const Transactions = require("../model/v1/Transactions");
const Notification = require("../model/v1/Notification");
const Employee = require("../model/v1/Employee");
const Category = require("../model/v1/Category");
const { validationResult } = require("express-validator");
const couponModel = require("../model/v1/couponCode.model");

const cloudinary = require("cloudinary").v2;

const updateProfile = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		console.log({ body: req.body });
		const { authId } = req;

		// const { name, email, address, pinCode, gender, lat, lng, landmark } =
		// 	req.body;
		const { name, email, address, pinCode, gender, lat, lng, landmark, image } =
			req.body;

		// const emailAlreadyUsed = await User.findOne({ email });
		// if (emailAlreadyUsed)
		// 	return res.json({
		// 		error: true,
		// 		message: "email is already used, please use another",
		// 	});

		const profile = await User.findOneAndUpdate(
			{
				_id: authId,
			},
			{
				name,
				email,
				address,
				pinCode,
				gender,
				landmark,
				isProfileComplete: true,
				userImage: image,
				location: {
					lat,
					lng,
				},
				// {
				// 	name,
				// 	email,
				// 	address,
				// 	pinCode,
				// 	gender,
				// 	landmark,
				// 	isProfileComplete: true,
				// 	location: {
				// 		lat,
				// 		lng,
				// 	},
			},
			{ new: true }
		);
		// console.log(profile);
		if (!profile)
			return res.json({
				error: true,
				message: "unable to create profile",
			});

		return res.json({
			error: false,
			message: "profile created successfully!",
			payload: profile,
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
const updateToken = async (req, res) => {
	try {
		const { authId } = req;

		const { token } = req.body;

		const profile = await User.findOneAndUpdate(
			{
				_id: authId,
			},
			{
				deviceId: token,
				deviceType: deviceType,
			},
			{ new: true }
		);
		// console.log(profile);
		if (!profile)
			return res.json({
				error: true,
				message: "unable to add",
			});

		return res.json({
			error: false,
			message: "token added successfully!",
			payload: profile,
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

const updateDeliveryAddress = async (req, res) => {
	try {
		const { address, street, city, state, pinCode, addressType, lat, lng } =
			req.body;
		const { authId } = req;

		// console.log(_id);
		// console.log(uid);

		const profile = await User.findOneAndUpdate(
			{ _id: authId },
			{
				addressObj: {
					address,
					street,
					city,
					state,
					pinCode,
					addressType,
				},
				location: {
					lat,
					lng,
				},
			},
			{
				new: true,
			}
		);
		console.log(profile);
		if (!profile)
			return res.json({
				error: true,
				message: "unable to update delivery address",
			});

		return res.json({
			error: false,
			message: "Added Address in your profile",
			payload: profile,
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

const getProfile = async (req, res) => {
	console.log("inside  profiel info called");
	try {
		const { authId } = req;
		// const { location } = req.query;

		const profile = await User.findOne({ _id: authId }).populate("wishlists");
		let carts = await Cart.find({
			user: authId,
			isCompletedToOrder: false,
		});
		if (!profile)
			return res.json({
				error: true,
				message: "no profile found",
			});

		return res.json({
			error: false,
			message: "profile found",
			payload: profile,
			cartCount: carts.length,
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
		const { authId, profile } = req;

		let notifications = await Notification.find({
			user: authId,
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
const getAllPayments = async (req, res) => {
	try {
		const { authId, profile } = req;
		// const profile = await User.findOne({ _id: authId });
		let transactions = await Transactions.find({
			customer: authId,
		}).select(
			"razorpayId amount  isCOD isPaid order isDispute serviceIds createdAt updatedAt"
		);
		if (!transactions)
			return res.json({
				error: true,
				message: "no transactions found",
			});

		return res.json({
			error: false,
			message: "transactions found",
			payload: transactions,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const getAllReviews = async (req, res) => {
	try {
		const { authId, profile } = req;
		// const profile = await User.findOne({ _id: authId });
		let reviews = await Review.find({
			user: authId,
		}).select(
			"image title description employeeRating serviceRating createdAt updatedAt"
		);
		if (!reviews)
			return res.json({
				error: true,
				message: "no reviews found",
			});

		return res.json({
			error: false,
			message: "reviews found",
			payload: reviews,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};

const addInCart = async (req, res) => {
	try {
		const { authId } = req;
		const {
			packageId,
			categoryId,
			selectedDate,
			selectedTime,
			selectedEmployee,
		} = req.body;
		const isAlready = await Cart.findOne({
			user: authId,
			package: packageId,
			isCompletedToOrder: false,
		});

		if (isAlready)
			return res.json({
				error: true,
				message:
					"This package in your cart, please first remove from cart to update",
				isVisitCartButton: true,
			});
		console.log(authId);
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
			user: authId,
			category: categoryId,
			selectedDate,
			selectedTime,
			employee: selectedEmployee,
			serviceId: crypto.randomInt(10 ** 7, 10 ** 8 - 1),
			isEmployeeSelectedByUser: selectedEmployee ? true : false,
		}).save();
		// let profileUpdate = await User.findOneAndUpdate(
		// 	{ _id: authId },
		// 	{
		// 		$push: {
		// 			cart: cart._id,
		// 		},
		// 	}
		// );
		// // profile.cart.push(cart._id);
		// // profile = await profile.save();
		// // return res.status(200).send(profile);
		if (!cart)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		let carts = await Cart.find({
			user: authId,
			isCompletedToOrder: false,
		});

		return res.json({
			error: false,
			message: "Package added in your cart",
			payload: cart,
			cartCount: carts.length,
			isVisitCartButton: true,
		});
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
		const { authId } = req;
		const { selectedDate, selectedTime, cartId } = req.body;
		const cart = await Cart.findOneAndUpdate(
			{
				_id: cartId,
				user: authId,
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
const addWishlist = async (req, res) => {
	try {
		const { authId } = req;
		const { packageId } = req.body;
		const isAlready = await User.findOne({
			_id: authId,
			wishlists: { $in: [packageId] },
		});

		if (isAlready)
			return res.json({
				error: true,
				message: "Already in your wishlist",
			});
		let profile = await User.findOneAndUpdate(
			{ _id: authId },
			{
				$push: {
					wishlists: packageId,
				},
			},
			{ new: true }
		);
		// let package = await Package.findOne({ _id: packageId });
		// if (!package.isActive) {
		// 	// const shop = await Shops.findOne({ _id: package.shopId });
		// 	// sendSMSViaTelegram(
		// 	// 	`${shop.chatId}`,
		// 	// 	`${profile.name}(Customer) tried to order ${package.name}, but it is out of stock. Total Item sold are ${product.sold}. Please update the product status in the Dashboard.`
		// 	// );
		// 	return res.json({
		// 		error: true,
		// 		message:
		// 			"Package is Not Available for booking, please check after some time",
		// 	});
		// }

		// return res.status(200).send(profile);
		if (!profile)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			error: false,
			message: "Added in your Wishlist",
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
const removeWishlist = async (req, res) => {
	try {
		const { authId } = req;
		const { packageId } = req.body;
		const profile = await User.findOneAndUpdate(
			{
				_id: authId,
			},
			{
				$pull: {
					wishlists: packageId,
				},
			},
			{ new: true }
		);

		if (!profile)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			error: false,
			message: "Removed from your Wishlist",
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
const removeReview = async (req, res) => {
	try {
		const { authId } = req;
		const { reviewId } = req.body;
		const profile = await User.findOneAndUpdate(
			{
				_id: authId,
			},
			{
				$pull: {
					wishlists: reviewId,
				},
			},
			{ new: true }
		);

		if (!profile)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			error: false,
			message: "Removed from your Wishlist",
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

// const increaseQuantity = async (req, res) => {
// 	const { uid } = req.user;
// 	const { productId, isIncreament } = req.body;
// 	const change = isIncreament ? 1 : -1;
// 	console.log(productId, change);
// 	// if (isIncreament) {
// 	// 	const product = await Product.findOne({
// 	// 		_id: productId,
// 	// 	});
// 	// 	// if(product?.)
// 	// }
// 	let profile = await User.findOneAndUpdate(
// 		{
// 			uid: uid,
// 			"cart.package": productId,
// 		},
// 		{
// 			$inc: { "cart.$.quantity": change },
// 		},
// 		{ new: true }
// 	).populate("cart.pacakge");

// 	console.log(profile);
// 	const { subTotal, COD, GST, total, totalPrepaidBeforeCodAmount } =
// 		await _calculatePrice({ profile });

// 	if (!profile)
// 		return res.json({
// 			error: true,
// 			message: "unable to find product",
// 		});
// 	// const {} = await _calculatePrice({ profile });
// 	return res.json({
// 		error: false,
// 		message: "increased quantity",
// 		payload: profile,
// 		amount: { subTotal, COD, GST, total, totalPrepaidBeforeCodAmount },
// 	});
// };

// const decreaseQuantity = async (req, res) => {
// 	const { uid } = req.user;
// 	const { productId } = req.body;
// 	console.log(productId);
// 	let profile = await User.findOneAndUpdate(
// 		{
// 			uid: uid,
// 			"cart.productId": productId,
// 		},
// 		{
// 			$inc: { "cart.$.quantity": -1 },
// 		},
// 		{ new: true }
// 	).populate("cart.productId");

// 	console.log(profile);

// 	if (!profile)
// 		return res.json({
// 			error: true,
// 			message: "unable to find product",
// 		});

// 	return res.json({
// 		error: false,
// 		message: "increased quantity",
// 		payload: profile,
// 	});
// };

const getCart = async (req, res) => {
	try {
		const { authId } = req;
		const { couponCode } = req.query;
		let carts = await Cart.find({
			user: authId,
			isCompletedToOrder: false,
		}).populate("package employee");

		if (carts?.length <= 0)
			return res.json({
				error: false,
				message: "No item in cart, Please add some items",
			});

		const coupon = await couponModel.findOne({ code: couponCode, status: 1 });
		if (couponCode && !coupon)
			return res.json({
				error: true,
				message: "Invalid Coupon Code",
			});

		let subTotal = 0;
		let totalGST = 0;
		let totalBeforeGST = 0;

		const cart = carts?.map(({ package }) => {
			const gstValue = package.gst || 0;
			const calculatedGST =
				(parseFloat(package.price.toFixed(2)) *
					parseFloat(gstValue.toFixed(2))) /
				100;
			const totalPrice = parseFloat(package.price.toFixed(2)) + calculatedGST;

			totalBeforeGST += parseFloat(package.price.toFixed(2));
			subTotal += totalPrice;
			totalGST += calculatedGST;

			const simplePackage = {
				price: parseFloat(package.price.toFixed(2)),
				gst: package.gst,
				MRP: parseFloat(package.MRP.toFixed(2)),
				id: package._id,
				title: package.title,
			};

			return simplePackage;
		});
		// if (subTotal)
		// 	return res.json({
		// 		error: true,
		// 		message: `Minimum amount should be ${minAmount}`,
		// 	});
		const beforeDiscount = subTotal;
		subTotal =
			subTotal -
			(coupon?.discountType === "percentage"
				? (subTotal * coupon?.discount) / 100
				: coupon?.discount || 0);
		return res.json({
			error: false,
			message: "cart items",
			// payload: cart,
			payload: carts,
			totalBeforeGST,
			totalGST,
			beforeDiscountAmount: parseFloat(beforeDiscount.toFixed(2)),
			discountPercentage:
				coupon?.discountType === "percentage" ? coupon?.discount : 0,
			discountAmount:
				coupon?.discountType === "amount"
					? coupon?.discount
					: parseFloat((beforeDiscount - subTotal).toFixed(2)),
			totalPaidAmount: parseFloat(subTotal.toFixed(2)),
		});

		// return res.json({
		// 	error: false,
		// 	message: "cart items",
		// 	payload: carts,
		// });
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const getTotalPrice = async (req, res) => {
	try {
		const { authId } = req;
		let carts = await Cart.find({
			user: authId,
			isCompletedToOrder: false,
		}).populate("package");
		if (!carts)
			return res.json({
				error: true,
				message: "No item in cart, Please add some items",
			});

		let subTotal = 0;
		let totalGST = 0;
		let totalBeforeGST = 0;

		const cart = carts.map(({ package }) => {
			const gstValue = package.gst || 0;
			const calculatedGST =
				(parseFloat(package.price.toFixed(2)) *
					parseFloat(gstValue.toFixed(2))) /
				100;
			const totalPrice = parseFloat(package.price.toFixed(2)) + calculatedGST;

			totalBeforeGST += parseFloat(package.price.toFixed(2));
			subTotal += totalPrice;
			totalGST += calculatedGST;

			const simplePackage = {
				price: parseFloat(package.price.toFixed(2)),
				gst: package.gst,
				MRP: parseFloat(package.MRP.toFixed(2)),
				id: package._id,
				title: package.title,
			};

			return simplePackage;
		});
		// let total=

		return res.json({
			error: false,
			message: "cart items",
			payload: cart,
			subTotal,
			totalBeforeGST,
			totalGST,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};

const removePackage = async (req, res) => {
	try {
		const { authId } = req;
		const { cartId } = req.body;
		console.log({ cartId });
		let cart = await Cart.findOneAndRemove(
			{
				user: authId,
				_id: cartId,
			},
			{ new: true }
		);
		if (!cart)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			error: false,
			message: "Removed product from cart",
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

const checkout = async (req, res) => {
	try {
		const { uid } = req.user;
		let profile = await User.findOne({ uid: uid }).populate("cart.productId");

		const sum = profile.cart.reduce((preValue, currentValue) => {
			return preValue + currentValue.productId.price * currentValue.quantity;
		}, 0);

		if (sum == 0)
			return res.json({
				error: true,
				message: "no item in your cart",
			});
		const shippingCost = 0,
			taxes = 0;

		return res.json({
			error: false,
			message: "Here is your cart",
			payload: {
				subTotal: sum,
				shippingCost,
				taxes,
				grandTotal: sum + shippingCost + taxes,
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

const registerPlatform = async (req, res) => {
	try {
		const { deviceId, devicePlatform } = req.body;
		const { uid } = req.user;

		const user = await User.findOneAndUpdate(
			{
				uid,
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

const addLocation = async (req, res) => {
	try {
		const { latitude, longitude } = req.body;
		const { uid } = req.user;

		const user = await User.findOneAndUpdate(
			{
				uid,
			},
			{
				location: {
					type: "Point",
					coordinates: [longitude, latitude],
				},
				isLocation: true,
			},
			{ new: true }
		);

		if (user) {
			return res.json({
				error: false,
				message: "updated location successfully",
				payload: user,
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

// Calculate new average rating
function calculateNewAverage(existingAverage, newRating, totalReviews) {
	const newAverage =
		(existingAverage * totalReviews + newRating) / (totalReviews + 1);
	return Math.round(newAverage * 100) / 100; // Round to two decimal places
}

const addReview = async (req, res) => {
	try {
		const {
			title,
			description,
			employeeRating,
			serviceRating,
			packageId,
			employeeId,
			categoryId,
			serviceId,
		} = req.body;
		const { authId, profile } = req;
		const isAlready = await Review.findOne({
			serviceId,
		});
		if (isAlready)
			return res.json({
				error: true,
				message: "You had already provided your review",
			});
		const review = await new Review({
			user: authId,
			title,
			description,
			employeeRating,
			serviceRating,
			packageId,
			employeeId,
			categoryId,
			serviceId,
			image: profile.userImage,
		}).save();
		const package = await Package.findOne({
			_id: packageId,
		});
		const employee = await Employee.findOne({
			_id: employeeId,
		});
		const category = await Category.findOne({
			_id: categoryId,
		});
		await Package.findOneAndUpdate(
			{
				_id: packageId,
			},
			{
				$push: {
					reviews: review?._id,
				},
				$set: {
					rating: calculateNewAverage(
						package.rating,
						serviceRating,
						package.reviews.length
					),
				},
			}
		);
		await Category.findOneAndUpdate(
			{
				_id: categoryId,
			},
			{
				$push: {
					reviews: review?._id,
				},
				$set: {
					rating: calculateNewAverage(
						category.rating,
						serviceRating,
						category.reviews.length
					),
				},
			}
		);
		if (employee) {
			await Employee.findOneAndUpdate(
				{
					_id: employeeId,
				},
				{
					$push: {
						reviews: review?._id,
					},
					$set: {
						rating: calculateNewAverage(
							employee.rating,
							employeeRating,
							employee.reviews.length
						),
					},
				}
			);
		}

		// const user = await User.findOneAndUpdate(
		// 	{
		// 		uid,
		// 	},
		// 	{
		// 		location: {
		// 			type: 'Point',
		// 			coordinates: [longitude, latitude],
		// 		},
		// 		isLocation: true,
		// 	},
		// 	{ new: true }
		// );

		if (review) {
			return res.json({
				error: false,
				message: "Thanks for providing your valuable feedback.",
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

// const verify = async (req, res) => {
// 	try {
// 		console.log(req.body);
// 		const shasum = crypto.createHmac(
// 			"sha256",
// 			process.env.RAZORPAY_WEBHOOK_SECRET
// 		);
// 		shasum.update(JSON.stringify(req.body));
// 		const digest = shasum.digest("hex");

// 		console.log(digest, req.headers["x-razorpay-signature"]);

// 		if (digest === req.headers["x-razorpay-signature"]) {
// 			console.log("_____________request is legit_________");

// 			console.log(req.body);

// 			const razorpayOrderId = req.body.payload.payment.entity.order_id;
// 			const amount = req.body.payload.payment.entity.amount / 100;
// 			const currency = req.body.payload.payment.entity.currency;
// 			const status = req.body.payload.payment.entity.status;
// 			const error_code = req.body.payload.payment.entity.error_code;
// 			const error_reason = req.body.payload.payment.entity.error_reason;
// 			const notes = req.body.payload.payment.entity.notes;

// 			console.log("Some NOTES from payload", JSON.stringify(notes));
// 			console.table({
// 				razorpayOrderId,
// 				amount,
// 				currency,
// 				status,
// 				error_code,
// 				error_reason,
// 			});

// 			if (!error_code && status === "captured") {
// 				const profile = await User.findOne({ uid: notes.uid });
// 				const order = await Orders.findOne({ _id: notes.orderId });
// 				// const products = [];
// 				order.products.forEach(async (product) => {
// 					const {
// 						productId,
// 						status,
// 						quantity,
// 						mrp,
// 						discount,
// 						attributeSelected,
// 					} = product;
// 					// products.push({
// 					// 	productId,
// 					// 	quantity,
// 					// 	mrp,
// 					// 	discount,
// 					// 	attributeSelected,
// 					// 	status: 'PAID',
// 					// });
// 					const product_update = await Product.findOneAndUpdate(
// 						{ _id: productId },
// 						{
// 							$inc: {
// 								stock: -1,
// 								sold: 1,
// 							},
// 							$set: {
// 								lastSoldDate: new Date(),
// 							},
// 						},
// 						{
// 							new: true,
// 						}
// 					).populate("shopId");
// 					console.log({ product_update });
// 					// TODO change to 5
// 					if (product_update.stock < 50) {
// 						sendSMSViaTelegram(
// 							`${product_update.shopId.chatId}`,
// 							`${product_update.name} is only ${product_update.stock} stock left. Please update the stock`
// 						);
// 					}
// 				});
// 				console.log({ profile });
// 				const order_updated = await Orders.findOneAndUpdate(
// 					{ _id: notes.orderId },
// 					{
// 						amountPaid: amount,
// 						paymentStatus: status,
// 						deliveryStatus: "ORDERED",
// 						errorCode: error_code,
// 						errorReason: error_reason,
// 						paymentMode: notes.paymentMode,
// 						isAmountPaid: true,
// 						razorpayOrderId: razorpayOrderId,
// 					},
// 					{
// 						new: true,
// 					}
// 				).populate("shopId");
// 				sendSMSViaTelegram(
// 					`${order_updated.shopId.chatId}`,
// 					`You have got One order with Order Id ${order_updated._id}. Amount Paid is Rs. ${order_updated.amountPaid}. Please use Admin panel to see details.`
// 				);
// 				// const profileUpdated = await User.findOneAndUpdate(
// 				// 	{ uid: notes.uid },
// 				// 	{
// 				// 		$push: {
// 				// 			orders: order._id,
// 				// 		},
// 				// 		$set: {
// 				// 			cart: [],
// 				// 		},
// 				// 	},
// 				// 	{
// 				// 		new: true,
// 				// 	}
// 				// );
// 				return res.json({ status: "ok" });
// 			} else {
// 				return res.json({ status: "ok" });
// 			}
// 		} else {
// 			// pass it
// 			return res.json({ status: "ok" });
// 		}
// 	} catch (error) {
// 		console.log({ error });
// 		// TODO sentry error also
// 		sendSMSViaTelegram(OWNER_CHATID, `WebHook Failed`);
// 		// if there is error then update payment details just with the order Id
// 		return res.status(500).json({ status: "not ok" });
// 	}
// };
// const serverVerify = async (req, res) => {
// 	try {
// 	} catch (error) {
// 		console.log(error);
// 		return res.json({
// 			error: true,
// 			message: "Something wents wrong, Please try after sometime",
// 		});
// 	}
// };
// const handlePayment = async (req, res) => {
// 	try {
// 		const { paymentType, shopId } = req.body;
// 		console.log({ paymentType });
// 		// if paymentType === COD, then fire razorpay to charge totalPrepaidBeforeCodAmount
// 		const { uid } = req.user;
// 		let profile = await User.findOne({ uid: uid }).populate("cart.productId");
// 		if (!profile.cart.length)
// 			return res.json({
// 				error: false,
// 				message: "Please add some items",
// 			});
// 		const { subTotal, COD, GST, total, totalPrepaidBeforeCodAmount } =
// 			await _calculatePrice({ profile });
// 		const products = [];
// 		profile.cart.forEach((product) => {
// 			const { productId, quantity, mrp, discount, attributeSelected } = product;
// 			products.push({
// 				productId,
// 				quantity,
// 				mrp,
// 				discount,
// 				attributeSelected,
// 			});
// 		});
// 		console.log({ profile });
// 		// const order = await new Orders({
// 		// 	orderId: uuidv4(),
// 		// 	customerId: profile._id,
// 		// 	amountPaid: 0,
// 		// 	totalAmount: total,
// 		// 	paymentStatus: 'NOT_PAID',
// 		// 	deliveryStatus: 'ORDERED',
// 		// 	errorCode: null,
// 		// 	errorReason: null,
// 		// 	paymentMode: 'COD',
// 		// 	products,
// 		// 	shopId,
// 		// 	isAmountPaid: false,
// 		// }).save();
// 		// const profileUpdated = await User.findOneAndUpdate(
// 		// 	{ uid: uid },
// 		// 	{
// 		// 		$push: {
// 		// 			orders: order._id,
// 		// 		},
// 		// 		$set: {
// 		// 			cart: [],
// 		// 		},
// 		// 	},
// 		// 	{
// 		// 		new: true,
// 		// 	}
// 		// );
// 		const shop = await Shops.findOne({ _id: shopId });
// 		// TODO test it
// 		if (totalPrepaidBeforeCodAmount === 0 && paymentType === "COD") {
// 			profile.cart.forEach(async (product) => {
// 				const { productId, quantity, mrp, discount, attributeSelected } =
// 					product;
// 				const product_update = await Product.findOneAndUpdate(
// 					{ _id: productId },
// 					{
// 						$inc: {
// 							stock: -1,
// 							sold: 1,
// 						},
// 						$set: {
// 							lastSoldDate: new Date(),
// 						},
// 					},
// 					{
// 						new: true,
// 					}
// 				).populate("shopId");
// 				console.log({ product_update });
// 				// TODO change to 5
// 				if (product_update.stock < 50) {
// 					sendSMSViaTelegram(
// 						`${product_update.shopId.chatId}`,
// 						`${product_update.name} is only ${product_update.stock} stock left. Please update the stock`
// 					);
// 				}
// 			});

// 			const order = await new Orders({
// 				orderId: uuidv4(),
// 				customerId: profile._id,
// 				amountPaid: 0,
// 				totalAmount: total,
// 				paymentStatus: "NOT_PAID",
// 				deliveryStatus: "ORDERED",
// 				errorCode: null,
// 				errorReason: null,
// 				paymentMode: "COD",
// 				products,
// 				shopId,
// 				isAmountPaid: false,
// 				CODAMOUNT: COD,
// 				isPrepaidBeforeCOD: false,
// 				prepaidAmount: 0,
// 			}).save();
// 			const profileUpdated = await User.findOneAndUpdate(
// 				{ uid: uid },
// 				{
// 					$push: {
// 						orders: order._id,
// 					},
// 					$set: {
// 						cart: [],
// 					},
// 				},
// 				{
// 					new: true,
// 				}
// 			);

// 			sendSMSViaTelegram(
// 				`${shop.chatId}`,
// 				`You have got One order with Order Id ${order._id}. It is a COD order. Please use Admin panel to see details.`
// 			);
// 			return res.json({
// 				error: false,
// 				message: "Order Created",
// 				payload: profileUpdated,
// 				isOnlinePayment: false,
// 			});
// 		} else {
// 			const receipt = uuidv4();
// 			var razorpay = new Razorpay({
// 				key_id: process.env.RAZORPAY_KEY_ID,
// 				key_secret: process.env.RAZORPAY_KEY_SECRET,
// 			});
// 			const payment_capture = 1;
// 			const currency = "INR";

// 			const options = {
// 				amount:
// 					paymentType === "COD"
// 						? totalPrepaidBeforeCodAmount * 100
// 						: total * 100,
// 				currency,
// 				receipt,
// 				payment_capture,
// 			};

// 			const response = await razorpay.orders.create(options);
// 			console.log(response);

// 			const profileUpdated = await User.findOneAndUpdate(
// 				{ uid: uid },
// 				{
// 					inProgressOrderID: response.id,
// 					inProgressReciept: receipt,
// 				},
// 				{
// 					new: true,
// 				}
// 			);

// 			return res.json({
// 				// orderId: order._id,
// 				id: response.id,
// 				currency: response.currency,
// 				amount: response.amount,
// 				profile: profile,
// 				key_id: process.env.RAZORPAY_KEY_ID,
// 				isOnlinePayment: true,
// 			});
// 		}
// 	} catch (error) {
// 		console.log(error);
// 	}
// };

module.exports = {
	addReview,
	// handlePayment,
	getProfile,
	updateProfile,
	addInCart,
	// increaseQuantity,
	getCart,
	// decreaseQuantity,
	removePackage,
	// checkout,
	updateDeliveryAddress,
	registerPlatform,
	addLocation,
	getTotalPrice,
	// verify,
	// serverVerify,
	addWishlist,
	removeWishlist,
	getAllPayments,
	updateToken,
	getNotification,
	getAllReviews,
	removeReview,
	rescheduleBooking,
};
