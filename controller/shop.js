const Shop = require("../model/v1/Shops");

const bcrypt = require("bcrypt");
const jsonWebToken = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const secret = process.env.SECRET;
const { body, validationResult } = require("express-validator");
const Shops = require("../model/v1/Shops");
const Product = require("../model/v1/Product");
const Seller = require("../model/v1/Seller");
const Orders = require("../model/v1/Orders");
const ShopConfig = require("../model/v1/ShopConfig");

const signIn = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}

		const { phoneNumber, password } = req.body;
		if (!phoneNumber || !password) {
			return res.json({
				error: true,
				message: "Incomplete Details",
			});
		}
		console.log(phoneNumber, password);
		const seller = await Seller.findOne({ phoneNumber: phoneNumber });
		console.log(seller);

		if (!seller)
			return res.json({
				error: true,
				message: "Shop not found",
			});

		// MATCH USER ENRCYPTED PASSWORD
		const isMatched = await bcrypt.compare(password, seller.password);
		if (!isMatched)
			return res.json({
				error: true,
				message: "Password does not matched",
			});

		//PASSWORD MATCHED
		const data = {
			name: seller.name,
			phoneNumber: seller.phoneNumber,
			_id: seller._id,
			role: "shop",
		};
		// JWT TOKEN SIGN
		const token = jsonWebToken.sign(data, secret, {
			expiresIn: "5d",
		});
		return res.json({
			error: false,
			message: "Signin Successfully",
			token: token,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};

const getProfile = async (req, res) => {
	const { _id } = req.user;
	console.log({ user: req.user });
	const seller = await Seller.findOne({ _id }).select(
		"name address coordinate timing phoneNumber  description publicPhoneNumber coins productSold coinGiven rating reviews updatedAt	createdAt"
	);
	const shop = await Shop.findOne({ ownerId: _id })
		.populate("products.product")
		// .populate('departments')
		.populate("categories");
	const orders = await Orders.find({ shopId: shop._id });
	// .populate('products.productId')
	// .populate('departments')
	// .populate('categories');

	const product = await Product.find({ shopId: shop._id }).sort({
		createdAt: -1,
	});

	return res.json({
		error: false,
		message: "details fetched",
		payload: {
			shop,
			product,
			seller,
			orders,
		},
	});
};
const getAllUsers = async (req, res) => {
	const { _id } = req.user;
	console.log({ user: req.user });
	const shop = await Shop.findOne({ ownerId: _id });

	const shopConfig = await ShopConfig.findOne({ shopId: shop._id }).populate(
		"users",
		"name phoneNumber email pinCode"
	);

	return res.json({
		error: false,
		message: "details fetched",
		payload: shopConfig,
	});
};

// const transferCoin = async (req, res) => {
// 	const { coins } = req.body;

// 	const { name } = req.params;

// 	console.log('Coins ' + coins);
// 	console.log('name ' + name);
// 	console.log(req.user);
// 	// validate that coins exists or not form the req.user
// 	if (req.user.coins < coins)
// 		return res.json({
// 			error: true,
// 			message: "you don't have this much coin, please recharge",
// 		});

// 	// send first
// 	const profile = await Profile.findOneAndUpdate(
// 		{
// 			name: name,
// 		},
// 		{ $inc: { coins: coins } },
// 		{ new: true }
// 	);

// 	if (!profile)
// 		return res.json({
// 			error: true,
// 			message: 'Username is not valid!',
// 		});

// 	// updating user coin count
// 	const shop = await Shops.findOneAndUpdate(
// 		{ _id: req.user._id },
// 		{ $inc: { coinGiven: coins, coins: -coins } },
// 		{
// 			new: true,
// 		}
// 	);

// 	if (!shop)
// 		return res.json({
// 			error: true,
// 			message: 'unable to send',
// 		});
// 	const updatedHistory = await new CoinHistory({
// 		fromId: req.user._id,
// 		toId: profile._id,
// 		coins: coins,
// 		fromAfter: req.coins,
// 		toAfter: profile.coins,
// 	}).save();

// 	// !!! DO NOT COMMENT IT AS IT IS FOR PRODUCTION
// 	console.log(
// 		` ${updatedHistory.coins} coins transfered from ${updatedHistory.fromId} to ${updatedHistory.toId}`
// 	);
// 	return res.json({
// 		error: false,
// 		message: 'Coin is successfully sent to user',
// 		payload: shop,
// 	});
// };

const getShops = async (req, res) => {
	const shops = await Shops.find().select(
		"name address coordinate timing productSold coinGiven rating createdAt updatedAt"
	);

	return res.json({
		error: false,
		message: "shops",
		payload: shops,
	});
};
const getShopPublic = async (req, res) => {
	const { name } = req.query;
	const shop = await Shops.findOne({
		name,
	}).populate("categories");
	// const shopConfig = await new ShopConfig({
	// 	shopId: shop._id,
	// 	envName: name,
	// }).save();
	// .select(
	// 	'name address coordinate timing productSold coinGiven rating'
	// );
	if (!shop)
		return res.json({
			error: true,
			message: "please check shop name",
		});

	return res.json({
		error: false,
		message: "shop fetched",
		payload: shop,
	});
};

const submitReview = async (req, res) => {
	const { shopId } = req.params;
	const { review, star } = req.body;
	const alreadySubmitted = await Product.findOne({
		_id: shopId,
		"reviews.$.by": req.profile._id,
	});

	if (alreadySubmitted)
		return res.json({
			error: true,
			message: "you had already submitted the review.",
		});
	const afterReview = await Shop.findOneAndUpdate(
		{
			_id: shopId,
		},
		{
			$push: {
				reviews: {
					review,
					star,
					by: req.profile._id,
				},
			},
		}
	);

	return res.json({
		error: false,
		message: "review added",
		payload: afterReview,
	});
};

const registerPlatform = async (req, res) => {
	try {
		const { deviceId, devicePlatform } = req.body;
		const { _id } = req.user;

		const user = await Shop.findOneAndUpdate(
			{
				_id,
			},
			{ deviceId, devicePlatform },
			{ new: true }
		);

		if (user) {
			return res.json({
				error: false,
				message: "updated token successfully",
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

const bannerAdd = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { title, subtitle, actionUrl, image, order, actionText } = req.body;
		const { shopId } = req.params;
		const shop = await Shop.findOneAndUpdate(
			{
				_id: shopId,
			},
			{
				$push: {
					banner: {
						title,
						subtitle,
						actionUrl,
						image,
						order,
						actionText,
					},
				},
			},
			{
				new: true,
			}
		);
		if (!shop)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "update successfully",
			payload: shop,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const discoverAdd = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { title, subTitle, actionUrl, image, actionText } = req.body;
		const { shopId } = req.params;
		const shop = await Shop.findOneAndUpdate(
			{
				_id: shopId,
			},
			{
				$push: {
					discoverSection: {
						title,
						subTitle,
						actionUrl,
						image,
						actionText,
					},
				},
			},
			{
				new: true,
			}
		);
		if (!shop)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "update successfully",
			payload: shop,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const bannerUpdate = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { title, subtitle, actionUrl, image, order } = req.body;
		const { shopId, bannerId } = req.params;
		const shop = await Shop.findOneAndUpdate(
			{
				_id: shopId,
				"banner._id": bannerId,
			},
			{
				$set: {
					"banner.$.title": title,
					"banner.$.subtitle": subtitle,
					"banner.$.actionUrl": actionUrl,
					"banner.$.image": image,
					"banner.$.order": order,
				},
			},
			{
				new: true,
			}
		);
		if (!shop)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "update successfully",
			payload: shop,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const discoverUpdate = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { title, subTitle, actionUrl, image, order } = req.body;
		const { shopId, discoverSectionId } = req.params;
		const shop = await Shop.findOneAndUpdate(
			{
				_id: shopId,
				"discoverSection._id": discoverSectionId,
			},
			{
				$set: {
					"discoverSection.$.title": title,
					"discoverSection.$.subTitle": subTitle,
					"discoverSection.$.actionUrl": actionUrl,
					"discoverSection.$.image": image,
					"discoverSection.$.order": order,
				},
			},
			{
				new: true,
			}
		);
		if (!shop)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "update successfully",
			payload: shop,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const bannerRemove = async (req, res) => {
	try {
		const { shopId, bannerId } = req.params;
		const shop = await Shop.findOneAndUpdate(
			{
				_id: shopId,
			},
			{
				$pull: {
					banner: {
						_id: bannerId,
					},
				},
			},
			{
				new: true,
			}
		);
		if (!shop)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "removed successfully",
			payload: shop,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const discoverRemove = async (req, res) => {
	try {
		const { shopId, discoverSectionId } = req.params;
		const shop = await Shop.findOneAndUpdate(
			{
				_id: shopId,
			},
			{
				$pull: {
					discoverSection: {
						_id: discoverSectionId,
					},
				},
			},
			{
				new: true,
			}
		);
		if (!shop)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "removed successfully",
			payload: shop,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const socialSiteAdd = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { image, url, title } = req.body;
		const { shopId } = req.params;
		const shop = await Shop.findOneAndUpdate(
			{
				_id: shopId,
			},
			{
				$push: {
					socialSites: {
						image,
						url,
						title,
					},
				},
			},
			{
				new: true,
			}
		);
		if (!shop)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "update successfully",
			payload: shop,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const socialSiteUpdate = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { image, url, title } = req.body;
		const { shopId, socialSiteId } = req.params;
		const shop = await Shop.findOneAndUpdate(
			{
				_id: shopId,
				"socialSites._id": socialSiteId,
			},
			{
				$set: {
					"socialSites.$.image": image,
					"socialSites.$.url": url,
					"socialSites.$.title": title,
				},
			},
			{
				new: true,
			}
		);
		if (!shop)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "update successfully",
			payload: shop,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const socialSiteRemove = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { shopId, socialSiteId } = req.params;
		const shop = await Shop.findOneAndUpdate(
			{
				_id: shopId,
			},
			{
				$pull: {
					socialSites: {
						_id: socialSiteId,
					},
				},
			},
			{
				new: true,
			}
		);
		if (!shop)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "removed successfully",
			payload: shop,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const librarySectionRemove = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { shopId, libraryId } = req.params;
		const shop = await Shop.findOneAndUpdate(
			{
				_id: shopId,
			},
			{
				$pull: {
					library: {
						_id: libraryId,
					},
				},
			},
			{
				new: true,
			}
		);
		if (!shop)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "removed successfully",
			payload: shop,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const headerAdd = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { main, points } = req.body;
		console.log({ main, points });
		const { shopId } = req.params;
		const shop = await Shop.findOneAndUpdate(
			{
				_id: shopId,
			},
			{
				header: {
					main: main,
					points: points,
				},
				// $push: {
				// 	points: {
				// 		title,
				// 		url,
				// 	},
				// },
			},
			{
				new: true,
			}
		);
		if (!shop)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "update successfully",
			payload: shop,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const mainHeaderAdd = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { mainHeaders } = req.body;
		const { shopId } = req.params;
		const shop = await Shop.findOneAndUpdate(
			{
				_id: shopId,
			},
			{
				mainHeaders,
			},
			{
				new: true,
			}
		);
		if (!shop)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "update successfully",
			payload: shop,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const footerAdd = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { footerObj } = req.body;
		const { shopId } = req.params;
		const shop = await Shop.findOneAndUpdate(
			{
				_id: shopId,
			},
			{
				footer: footerObj,
			},
			{
				new: true,
			}
		);
		if (!shop)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "update successfully",
			payload: shop,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const approveReview = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		// const { footerObj } = req.body;
		const { productId, reviewId } = req.params;
		const product = await Product.findOneAndUpdate(
			{
				_id: productId,
				"reviews._id": reviewId,
			},
			{
				"reviews.$.isApproved": true,
			},
			{
				new: true,
			}
		);
		console.log({ product, _id: productId, reviews_id: reviewId });
		let ratings = [];
		product.reviews.forEach((review) => {
			if (review.isApproved && review.count) {
				ratings.push(review.count);
			}
		});
		const averageRating = (
			ratings.reduce((a, b) => a + b) / ratings.length
		).toFixed(2);

		const productAgain = await Product.findOneAndUpdate(
			{
				_id: productId,
			},
			{
				averageRating,
			},
			{
				new: true,
			}
		);

		if (!productAgain)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "update successfully",
			payload: productAgain,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const emailSectionAdd = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { title, subTitle, image, points } = req.body;
		const { shopId } = req.params;
		const shop = await Shop.findOneAndUpdate(
			{
				_id: shopId,
			},
			{
				emailSection: {
					title,
					subTitle,
					image,
					points,
				},
			},
			{
				new: true,
			}
		);
		if (!shop)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "update successfully",
			payload: shop,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const offerSectionAdd = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { title, subTitle, image, actionUrl, actionText } = req.body;
		const { shopId } = req.params;
		const shop = await Shop.findOneAndUpdate(
			{
				_id: shopId,
			},
			{
				offerSection: {
					title,
					subTitle,
					image,
					actionUrl,
					actionText,
				},
			},
			{
				new: true,
			}
		);
		if (!shop)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "update successfully",
			payload: shop,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const discountSectionAdd = async (req, res) => {
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
			title,
			subTitle,
			image,
			actionUrl,
			secondaryActionUrl,
			actionText,
			secondaryActionText,
		} = req.body;
		const { shopId } = req.params;
		const shop = await Shop.findOneAndUpdate(
			{
				_id: shopId,
			},
			{
				discountSection: {
					title,
					subTitle,
					image,
					actionUrl,
					secondaryActionUrl,
					actionText,
					secondaryActionText,
				},
			},
			{
				new: true,
			}
		);
		if (!shop)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "update successfully",
			payload: shop,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const librarySectionAdd = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { title, discount, image } = req.body;
		const { shopId } = req.params;
		const shop = await Shop.findOneAndUpdate(
			{
				_id: shopId,
			},
			{
				$push: {
					library: {
						title,
						discount,
						image,
					},
				},
			},
			{
				new: true,
			}
		);
		if (!shop)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "update successfully",
			payload: shop,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const addReview = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { userImage, title, name, count } = req.body;
		const { shopId } = req.params;
		const shop = await Shop.findOneAndUpdate(
			{
				_id: shopId,
			},
			{
				$push: {
					testionmials: {
						userImage,
						title,
						name,
						count,
					},
				},
			},
			{
				new: true,
			}
		);
		if (!shop)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "update successfully",
			payload: shop,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const addYoutubeVideos = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { videoId } = req.body;
		const { shopId } = req.params;
		const shop = await Shop.findOneAndUpdate(
			{
				_id: shopId,
			},
			{
				$push: {
					videos: videoId,
				},
			},
			{
				new: true,
			}
		);
		if (!shop)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "update successfully",
			payload: shop,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const updatePaymentStatus = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { paymentStatus } = req.body;
		const { shopId, mongoOrderId } = req.params;
		const order = await Orders.findOneAndUpdate(
			{
				shopId,
				_id: mongoOrderId,
			},
			{
				$set: {
					paymentStatus: paymentStatus,
				},
			},
			{
				new: true,
			}
		);
		if (!order)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "update successfully",
			payload: order,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const updateDeliveryStatus = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({
				error: true,
				message: `${errors.array()[0].msg} ${errors.array()[0].param}`,
			});
		}
		const { deliveryStatus } = req.body;
		const { shopId, mongoOrderId } = req.params;
		const order = await Orders.findOneAndUpdate(
			{
				shopId,
				_id: mongoOrderId,
			},
			{
				$set: {
					deliveryStatus: deliveryStatus,
				},
			},
			{
				new: true,
			}
		);
		if (!order)
			return res.json({
				error: true,
				message: "not able to update",
			});

		return res.json({
			error: false,
			message: "update successfully",
			payload: order,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const getOrders = async (req, res) => {
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
		const orders = await Orders.find({
			shopId,
		})
			.lean()
			.populate("customerId", "addressObj name phoneNumber email _id")
			.populate("products.productId");
		if (!orders)
			return res.json({
				error: true,
				message: "No Orders",
			});

		return res.json({
			error: false,
			message: "All Orders",
			payload: orders,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
// const headerUpdate = async (req, res) => {
// 	try {
// 		const { main } = req.body;
// 		console.log({ main, points });
// 		const { shopId } = req.params;
// 		const shop = await Shop.findOneAndUpdate(
// 			{
// 				_id: shopId,
// 			},
// 			{
// 				header: {
// 					main: main,
// 					points: points,
// 				},
// 				// $push: {
// 				// 	points: {
// 				// 		title,
// 				// 		url,
// 				// 	},
// 				// },
// 			},
// 			{
// 				new: true,
// 			}
// 		);
// 		if (!shop)
// 			return res.json({
// 				error: true,
// 				message: 'not able to update',
// 			});

// 		return res.json({
// 			error: false,
// 			message: 'update successfully',
// 			payload: shop,
// 		});
// 	} catch (error) {
// 		console.log(error);
// 		return res.json({
// 			error: true,
// 			message: 'Something wents wrong, Please try after sometime',
// 		});
// 	}
// };

module.exports = {
	signIn,
	getShops,
	submitReview,
	getProfile,
	registerPlatform,
	getShopPublic,
	bannerAdd,
	bannerRemove,
	bannerUpdate,
	socialSiteAdd,
	socialSiteUpdate,
	socialSiteRemove,
	headerAdd,
	mainHeaderAdd,
	emailSectionAdd,
	offerSectionAdd,
	discountSectionAdd,
	librarySectionAdd,
	librarySectionRemove,
	discoverAdd,
	discoverUpdate,
	discoverRemove,
	footerAdd,
	approveReview,
	addReview,
	getOrders,
	updatePaymentStatus,
	updateDeliveryStatus,
	getAllUsers,
	addYoutubeVideos,
};
