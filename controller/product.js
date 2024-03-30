const Product = require('../model/v1/Product');
const Category = require('../model/v1/Category');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const addProduct = async (req, res) => {
	const { shopId } = req.params;
	try {
		const {
			name,
			description,
			stock,
			availableOn,
			availableTill,
			features,
			mrp,
			discount,
			quickFeatures,
			maxOrderQuantity,
			images,
			isLimitedEdition,
			isFeatured,
			isNewProduct,
			categoryId,
			isCodEnabled,
			isOnlinePaymentEnabled,
			isBuyOnWhatsAppEnabled,
			isPickupAvailable,
			pickUpDiscount,
			deliveryCharge,
			isPrepaidBeforeCod,
			prepaidBeforeCodAmount,
		} = req.body;
		const isActualOwner = shopId.toString() == req.shop._id.toString();
		if (!isActualOwner) {
			return res.json({
				error: true,
				message: 'Something went wrong.',
			});
		}
		if (!name || !stock || !mrp || !discount) {
			return res.json({
				error: true,
				message: 'Please provide name, stock, mrp and discount.',
			});
		}
		if (!images || images.length < 1) {
			return res.json({
				error: true,
				message: 'Please add atleast one image',
			});
		}

		const product = await new Product({
			name,
			description,
			stock,
			availableOn,
			availableTill,
			features,
			mrp,
			discount,
			quickFeatures,
			maxOrderQuantity,
			images,
			isLimitedEdition,
			isFeatured,
			categoryId,
			isNewProduct,
			shopId,
			isOnlinePaymentEnabled,
			isBuyOnWhatsAppEnabled,
			isPickupAvailable,
			pickUpDiscount,
			deliveryCharge,
			isPrepaidBeforeCod,
			prepaidBeforeCodAmount,
			isCodEnabled,
		}).save();
		const category = await Category.findOneAndUpdate(
			{ _id: categoryId },
			{
				$push: {
					products: product._id,
				},
			},
			{ new: true }
		);
		console.log({ category });

		if (!product)
			return res.json({
				error: true,
				message: 'unable to add product',
			});
		// const products = await Product.find({
		// 	addedBy: req.user._id,
		// });
		// sendSMSViaTelegram(
		// 	GROUP_CHATID,
		// 	`New Product added via Telegram\n ${WEBSITE_URL}/product/${product.id} \n Shop name is ${shop.name}`
		// );
		return res.json({
			error: false,
			message: 'product added successfully',
			payload: product,
		});
	} catch (err) {
		console.error('Error ', err);
		if (err.name == 'ValidationError') {
			console.error('Error Validating!', err);
			res.json({
				error: true,
				message: err.message,
			});
		} else {
			console.error(err);
			res.json({
				error: true,
				message: 'Something went wrong, please try after some time',
			});
		}
	}
};
const addQuickProduct = async (req, res) => {
	try {
		const {
			name,
			description,
			stock,
			mrp,
			discount,
			images,
			isCodEnabled,
			isOnlinePaymentEnabled,
			isBuyOnWhatsAppEnabled,
			deliveryCharge,
		} = req.body;

		if (!name || !stock || !mrp || !discount) {
			return res.json({
				error: true,
				message: 'Please provide name, stock, mrp and discount.',
			});
		}
		if (!images || images.length < 1) {
			return res.json({
				error: true,
				message: 'Please add atleast one image',
			});
		}

		const product = await new Product({
			name,
			description,
			stock,
			mrp,
			discount,
			images,
			isCodEnabled,
			isOnlinePaymentEnabled,
			isBuyOnWhatsAppEnabled,
			deliveryCharge,
			shopId: req.shop._id,
		}).save();

		if (!product)
			return res.json({
				error: true,
				message: 'unable to add product',
			});
		// const products = await Product.find({
		// 	addedBy: req.user._id,
		// });
		return res.json({
			error: false,
			message: 'product added successfully',
			payload: product,
		});
	} catch (err) {
		console.error('Error ', err);
		if (err.name == 'ValidationError') {
			console.error('Error Validating!', err);
			res.json({
				error: true,
				message: err.message,
			});
		} else {
			console.error(err);
			res.json({
				error: true,
				message: 'Something went wrong, please try after some time',
			});
		}
	}
};
const updateProduct = async (req, res) => {
	try {
		const { productId } = req.params;

		const {
			name,
			description,
			stock,
			availableOn,
			availableTill,
			features,
			mrp,
			discount,
			quickFeatures,
			maxOrderQuantity,
			images,
			isLimitedEdition,
			isFeatured,
			categoryId,
			isNewProduct,
			isCodEnabled,
			isOnlinePaymentEnabled,
			isBuyOnWhatsAppEnabled,
			isPickupAvailable,
			pickUpDiscount,
			deliveryCharge,
			isPrepaidBeforeCod,
			prepaidBeforeCodAmount,
		} = req.body;
		const product_old = await Product.findOne({
			_id: productId,
			shopId: req.shop._id,
		});
		// const isActualOwner = shopId.toString() == req.user._id.toString();
		if (!product_old) {
			return res.json({
				error: true,
				message: 'Product does not exist.',
			});
		}
		const product = await Product.findOneAndUpdate(
			{
				_id: productId,
			},
			{
				name,
				description,
				stock,
				availableOn,
				availableTill,
				features,
				mrp,
				discount,
				quickFeatures,
				maxOrderQuantity,
				images,
				isLimitedEdition,
				isFeatured,
				categoryId,
				isNewProduct,
				isOnlinePaymentEnabled,
				isBuyOnWhatsAppEnabled,
				isPickupAvailable,
				pickUpDiscount,
				deliveryCharge,
				isPrepaidBeforeCod,
				prepaidBeforeCodAmount,
				isCodEnabled,
			}
		);

		const category = await Category.findOneAndUpdate(
			{ _id: categoryId },
			{
				$push: {
					products: product._id,
				},
				// $pull:{
				// 	products: product._id,
				// }
			},
			{ new: true }
		);
		console.log({ category });

		if (!product)
			return res.json({
				error: true,
				message: 'unable to update product',
			});
		// const products = await Product.find({
		// 	addedBy: req.user._id,
		// });
		return res.json({
			error: false,
			message: 'product updated successfully',
			payload: product,
		});
	} catch (err) {
		console.error('Error ', err);
		if (err.name == 'ValidationError') {
			console.error('Error Validating!', err);
			res.json({
				error: true,
				message: err.message,
			});
		} else {
			console.error(err);
			res.json({
				error: true,
				message: 'Something went wrong, please try after some time',
			});
		}
	}
};
const deleteProduct = async (req, res) => {
	try {
		const { productId } = req.params;
		const productBeforeDelete = await Product.findOne({
			_id: productId,
		}).populate('shopId');
		if (!productBeforeDelete) {
			return res.json({
				error: true,
				message: "Product doesn't found.",
			});
		}
		const isActualOwner =
			productBeforeDelete.shopId.ownerId.toString() == req.user._id.toString();
		// console.log({ isActualOwner });
		if (!isActualOwner) {
			return res.json({
				error: true,
				message:
					'You are not the owner of the product, so you cannot delete it.',
			});
		}
		const product = await Product.findOneAndRemove({
			_id: productId,
		});

		const category = await Category.findOneAndUpdate(
			{ _id: product.categoryId },
			{
				$pull: {
					products: product._id,
				},
			},
			{ new: true }
		);
		console.log({ category });

		if (!product)
			return res.json({
				error: true,
				message: 'unable to update product',
			});
		// const products = await Product.find({
		// 	addedBy: req.user._id,
		// });
		return res.json({
			error: false,
			message: 'product removed successfully',
			payload: product,
		});
	} catch (err) {
		console.error('Error ', err);
		if (err.name == 'ValidationError') {
			console.error('Error Validating!', err);
			res.json({
				error: true,
				message: err.message,
			});
		} else {
			console.error(err);
			res.json({
				error: true,
				message: 'Something went wrong, please try after some time',
			});
		}
	}
};
const addVariant = async (req, res) => {
	try {
		const { productId } = req.params;

		const { variant } = req.body;

		const product = await Product.findOneAndUpdate(
			{
				_id: productId,
			},
			{ variant },
			{ new: true }
		);

		if (!product)
			return res.json({
				error: true,
				message: 'unable to update product',
			});
		// const products = await Product.find({
		// 	addedBy: req.user._id,
		// });
		return res.json({
			error: false,
			message: 'product updated successfully',
			payload: product,
		});
	} catch (err) {
		console.error('Error ', err);
		if (err.name == 'ValidationError') {
			console.error('Error Validating!', err);
			res.json({
				error: true,
				message: err.message,
			});
		} else {
			console.error(err);
			res.json({
				error: true,
				message: 'Something went wrong, please try after some time',
			});
		}
	}
};
const addAttribute = async (req, res) => {
	try {
		const { productId } = req.params;

		const { attribute } = req.body;

		const product = await Product.findOneAndUpdate(
			{
				_id: productId,
			},
			{ attribute },
			{ new: true }
		);

		if (!product)
			return res.json({
				error: true,
				message: 'unable to update product',
			});
		// const products = await Product.find({
		// 	addedBy: req.user._id,
		// });
		return res.json({
			error: false,
			message: 'product updated successfully',
			payload: product,
		});
	} catch (err) {
		console.error('Error ', err);
		if (err.name == 'ValidationError') {
			console.error('Error Validating!', err);
			res.json({
				error: true,
				message: err.message,
			});
		} else {
			console.error(err);
			res.json({
				error: true,
				message: 'Something went wrong, please try after some time',
			});
		}
	}
};

const getSingleProduct = async (req, res) => {
	const { productId } = req.params;
	const product = await Product.findOne({
		_id: productId,
	}).populate('reviews.review');
	// .populate('addedBy', '_id publicPhoneNumber name shopName')
	// .sort({ stock: -1 });
	if (!product)
		return res.json({
			error: true,
			message: 'Something wents wrong, Please try after sometime',
		});
	return res.json({
		error: false,
		message: 'product detail',
		payload: product,
	});
};
const getAllProducts = async (req, res) => {
	const { shopId } = req.params;
	const {
		category,
		page,
		query,
		isNewProduct,
		isFeatured,
		isLimitedEdition,
		isPickupAvailable,
		isOnSale,
	} = req.query;
	console.log({
		category,
	});
	const queryObj = {
		shopId,
	};
	// 'variant.$.Capcity': '8GB',
	if (category) queryObj.categoryId = category;
	if (isFeatured) queryObj.isFeatured = true;
	if (isNewProduct) queryObj.isNewProduct = true;
	if (isOnSale) queryObj.isOnSale = true;
	if (isLimitedEdition) queryObj.isLimitedEdition = true;
	if (isPickupAvailable) queryObj.isPickupAvailable = true;
	// $text: { $search: text },

	if (query) queryObj['$text'] = { $search: query };
	const pageNumber = parseInt(page || 1);
	// const skipDocuments = (pageNumber - 1) * 10;
	const options = {
		page: pageNumber,
		limit: 16,
		sort: { updatedAt: 'descending', createdAt: 'descending' },
	};
	const products = await Product.paginate(queryObj, options);
	// .populate('addedBy', '_id publicPhoneNumber name shopName')
	// .sort({ stock: -1 });
	if (!products)
		return res.json({
			error: true,
			message: 'Something wents wrong, Please try after sometime',
		});
	return res.json({
		error: false,
		message: 'products detail',
		payload: products,
	});
};
const getAllAdminProducts = async (req, res) => {
	const shop = req.shop;
	// console.log({shop2: shop})
	const options = {
		pagination: false,
	};
	const products = await Product.paginate(
		{
			shopId: shop._id,
		},
		options
	);
	// .populate('addedBy', '_id publicPhoneNumber name shopName')
	// .sort({ stock: -1 });
	if (!products)
		return res.json({
			error: true,
			message: 'Something wents wrong, Please try after sometime',
		});
	return res.json({
		error: false,
		message: 'products detail',
		payload: products,
	});
};
const getFilters = async (req, res) => {
	const { shopId } = req.params;
	const products = await Product.find({
		shopId,
	});
	// .select("stock variant attribute mrp discount ")
	// .populate('addedBy', '_id publicPhoneNumber name shopName')
	// .sort({ stock: -1 });
	const filterArray = [];
	const filterObj = {};
	const variantArray = [];
	const variantObj = {};
	products.forEach((product) => {
		// console.log({
		// 	product,
		// });
		const singleFilterObj = {};
		const singleVariantObj = {};

		const { attribute, variant } = product;
		// console.log({
		// 	attribute,
		// 	feature,
		// });
		if (attribute) {
			// filterObj[attribute.name] = attribute.library;

			attribute.forEach((singleAttribute) => {
				// console.log({
				// 	singleAttribute,
				// 	name: singleAttribute.name,
				// 	library: singleAttribute.library,
				// });
				if (singleAttribute) {
					const options = [];
					singleAttribute.library.forEach((singleLibrary) => {
						options.push(singleLibrary.key);
					});
					singleFilterObj[singleAttribute.name] = options;
				}
			});
			filterArray.push(singleFilterObj);
		}
		if (variant) {
			// filterObj[variant.name] = variant.library;

			variant.forEach((singleVariant) => {
				console.log({
					singleVariant,
					// name: singleVariant.name,
					// library: singleVariant.library,
				});
				if (singleVariant) {
					const options = [];
					singleVariant.library.forEach((singleLibrary) => {
						options.push(singleLibrary.key);
					});
					singleVariantObj[singleVariant.name] = options;
				}
			});
			variantArray.push(singleVariantObj);
		}
	});

	filterArray.forEach((singleFilter) => {
		// console.log({
		// 	singleFilter,
		// });

		for (const [key, value] of Object.entries(singleFilter)) {
			// console.log(`${key}: ${value}`);
			if (filterObj[key]) {
				// console.log('Present Before', filterObj[key]);
				// console.log({ value: filterObj[key].value });
				filterObj[key] = [...filterObj[key], ...value];
			} else {
				// console.log('Not Before');
				filterObj[key] = value;
			}
		}
		// filterObj[]
	});
	variantArray.forEach((singleFilter) => {
		// console.log({
		// 	singleFilter,
		// });

		for (const [key, value] of Object.entries(singleFilter)) {
			// console.log(`${key}: ${value}`);
			if (variantObj[key]) {
				// console.log('Present Before', variantObj[key]);
				// console.log({ value: variantObj[key].value });
				variantObj[key] = [...variantObj[key], ...value];
			} else {
				// console.log('Not Before');
				variantObj[key] = value;
			}
		}
		// filterObj[]
	});

	// console.log({
	// 	filterObj,
	// });
	// [...new Set(names)]

	// if (!filterObj)
	// 	return res.json({
	// 		error: true,
	// 		message: 'No Filter Found',
	// 	});

	const tempObj = {};
	for (const [key, value] of Object.entries(filterObj)) {
		tempObj[key] = [...new Set(value)];
	}
	const tempVariantObj = {};
	for (const [key, value] of Object.entries(variantObj)) {
		tempVariantObj[key] = [...new Set(value)];
	}

	// const uniqueSingleFilter = {
	// 	'Limited Edition': 'isLimitedEdition',
	// 	'Featured Product': 'isFeatured',
	// 	'New Product': 'isNewProduct',
	// 	'On Sale': 'isOnSale',
	// };
	const uniqueSingleFilter = [
		{
			name: 'Limited Edition',
			key: 'isLimitedEdition',
			des: 'Limited Edition Products',
		},
		{
			name: 'On Sale',
			key: 'isOnSale',
			des: 'Products currently on sale!',
		},
		{
			name: 'New Product',
			key: 'isNewProduct',
			des: 'Just added Products!',
		},
		{
			name: 'Featured Product',
			key: 'isFeatured',
			des: 'Featured Products!',
		},
	];
	// products.forEach((product) => {

	// })
	return res.json({
		error: false,
		message: 'filter detail',
		payload: {
			filterObj: tempObj,
			variantObj: tempVariantObj,
			uniqueSingleFilter,
		},
	});
};
const getNewArrivalProducts = async (req, res) => {
	const { shopId } = req.params;
	const products = await Product.find({
		shopId,
		stock: {
			$gte: 1,
		},
	})
		.sort({ updatedAt: 1 })
		.limit(10);
	// .populate('addedBy', '_id publicPhoneNumber name shopName')

	// .sort({ stock: -1 });
	if (!products)
		return res.json({
			error: true,
			message: 'Something wents wrong, Please try after sometime',
		});
	return res.json({
		error: false,
		message: 'products detail',
		payload: products,
	});
};
const getBestSellerProducts = async (req, res) => {
	const { shopId } = req.params;
	const products = await Product.find({
		shopId,
		stock: {
			$gte: 1,
		},
	})
		.sort({
			sold: 'descending',
		})
		.limit(10);
	// .sort('updatedAt');
	// .populate('addedBy', '_id publicPhoneNumber name shopName')
	// .sort({ stock: -1 });
	if (!products)
		return res.json({
			error: true,
			message: 'Something wents wrong, Please try after sometime',
		});
	return res.json({
		error: false,
		message: 'products detail',
		payload: products,
	});
};

// const  = async (req, res) => {
// 	// 	const options = {
// 	// 		page: 1,
// 	// 		limit: 10,
// 	// 	};
// 	// var myAggregate = myModel.aggregate();

// 	const product = await Product.find()
// 		.populate('addedBy', '_id publicPhoneNumber name shopName')
// 		.sort({ askedAvailablity: -1 });
// 	if (!product)
// 		return res.json({
// 			error: true,
// 			message: 'Something wents wrong, Please try after sometime',
// 		});
// 	return res.json({
// 		error: false,
// 		message: 'all products',
// 		payload: product,
// 	});
// };
// const getBestSellingWebsite = async (req, res) => {
// 	// var myAggregate = Product.aggregate();
// 	try {
// 		const { lat, long, locationRadius } = req.body;
// 		const { page } = req.query;
// 		console.log({ page });
// 		const pageNumber = parseInt(page || 1);
// 		const skipDocuments = (pageNumber - 1) * 10;
// 		// const options = {
// 		// 	page: page || 1,
// 		// 	limit: 10,
// 		// 	lean: true,
// 		// 	pagination: true,
// 		// 	sort: { askedAvailablity: -1 },
// 		// };
// 		const products = await Product.aggregate([
// 			{
// 				$geoNear: {
// 					near: {
// 						type: 'Point',
// 						coordinates: [long, lat],
// 					},
// 					distanceMultiplier: 0.001,
// 					distanceField: 'dist.calculated',
// 					spherical: true,
// 					maxDistance: locationRadius * 1000,
// 				},
// 			},
// 			{
// 				$project: {
// 					highlights: 0,
// 					categoryId: 0,
// 					categoryName: 0,
// 					location: 0,
// 					mrp: 0,
// 					rating: 0,
// 					reviews: 0,
// 					isAvaliable: 0,
// 					isFeatured: 0,
// 					stock: 0,
// 					sold: 0,
// 					addedBy: 0,
// 				},
// 			}, // Return all but the specified fields
// 			{ $sort: { askedAvailablity: 1 } },
// 			{
// 				$facet: {
// 					metadata: [{ $count: 'total' }, { $addFields: { page: pageNumber } }],
// 					data: [{ $skip: skipDocuments }, { $limit: 10 }], // add projection here wish you re-shape the docs
// 				},
// 			},
// 		]);
// 		// console.log(products);
// 		// const productAfterPopulate = await Product.populate(products, {
// 		// 	path: 'addedBy',
// 		// 	select: '_id publicPhoneNumber name shopName',
// 		// 	options: { sort: { askedAvailablity: 'desc' } },
// 		// });

// 		// console.log(productAfterPopulate);
// 		// const result = await Product.aggregatePaginate(products, options);
// 		return res.json({
// 			error: false,
// 			message: 'fetched all best sellign products',
// 			payload: products,
// 		});
// 	} catch (error) {
// 		console.log(error);
// 		return res.json({
// 			error: true,
// 			message: 'Something wents wrong, Please try after sometime',
// 		});
// 	}
// };
// const getNewProductsWebsite = async (req, res) => {
// 	// var myAggregate = Product.aggregate();
// 	try {
// 		const { lat, long, locationRadius } = req.body;
// 		const { page } = req.query;
// 		console.log({ page });
// 		const pageNumber = parseInt(page || 1);
// 		const skipDocuments = (pageNumber - 1) * 10;

// 		const products = await Product.aggregate([
// 			{
// 				$geoNear: {
// 					near: {
// 						type: 'Point',
// 						coordinates: [long, lat],
// 					},
// 					distanceMultiplier: 0.001,
// 					distanceField: 'dist.calculated',
// 					spherical: true,
// 					maxDistance: locationRadius * 1000,
// 				},
// 			},
// 			{
// 				$project: {
// 					highlights: 0,
// 					categoryId: 0,
// 					categoryName: 0,
// 					location: 0,
// 					mrp: 0,
// 					rating: 0,
// 					reviews: 0,
// 					isAvaliable: 0,
// 					isFeatured: 0,
// 					stock: 0,
// 					sold: 0,
// 					addedBy: 0,
// 				},
// 			}, // Return all but the specified fields
// 			{ $sort: { createdAt: -1 } },
// 			{
// 				$facet: {
// 					metadata: [{ $count: 'total' }, { $addFields: { page: pageNumber } }],
// 					data: [{ $skip: skipDocuments }, { $limit: 10 }], // add projection here wish you re-shape the docs
// 				},
// 			},
// 		]);
// 		// console.log(products);
// 		// const productAfterPopulate = await Product.populate(products, {
// 		// 	path: 'addedBy',
// 		// 	select: '_id publicPhoneNumber name shopName',
// 		// 	options: { sort: { askedAvailablity: 'desc' } },
// 		// });

// 		// console.log(productAfterPopulate);
// 		// const result = await Product.aggregatePaginate(products, options);
// 		return res.json({
// 			error: false,
// 			message: 'fetched all best sellign products',
// 			payload: products,
// 		});
// 	} catch (error) {
// 		console.log(error);
// 		return res.json({
// 			error: true,
// 			message: 'Something wents wrong, Please try after sometime',
// 		});
// 	}
// };

// const getRecent = async (req, res) => {
// 	const product = await Product.find()
// 		.populate('addedBy', '_id publicPhoneNumber name')
// 		.sort({ updatedAt: -1 });
// 	if (!product)
// 		return res.json({
// 			error: true,
// 			message: 'Something wents wrong, Please try after sometime',
// 		});
// 	return res.json({
// 		error: false,
// 		message: 'all products',
// 		payload: product,
// 	});
// };

// const submitReview = async (req, res) => {
// 	const { productId } = req.params;
// 	const { review, star } = req.body;

// 	console.log(productId);
// 	console.log(req.profile._id);

// 	const alreadySubmitted = await Product.findOne({
// 		_id: productId,
// 		'reviews.by': req.profile._id,
// 	});

// 	if (alreadySubmitted)
// 		return res.json({
// 			error: true,
// 			message: 'you had already submitted the review.',
// 		});

// 	const afterReview = await Product.findOneAndUpdate(
// 		{
// 			_id: productId,
// 		},
// 		{
// 			$push: {
// 				reviews: {
// 					review,
// 					star,
// 					by: req.profile._id,
// 				},
// 			},
// 		}
// 	);

// 	return res.json({
// 		error: false,
// 		message: 'review added',
// 		payload: afterReview,
// 	});
// };

// const getProductForSeller = async (req, res) => {
// 	const products = await Product.find({
// 		addedBy: req.user._id,
// 	});

// 	return res.json({
// 		error: false,
// 		message: 'all products',
// 		payload: products,
// 	});
// };
// const editProductSingle = async (req, res) => {
// 	const { id } = req.params;

// 	const { name, description, price, coin, stock, mrp, warranty, highlights } =
// 		req.body;

// 	const updateObj = {};

// 	if (name) updateObj.name = name;
// 	if (description) updateObj.description = description;
// 	if (price) updateObj.price = price;
// 	if (coin) updateObj.coin = coin;
// 	if (stock) updateObj.stock = stock;
// 	if (mrp) updateObj.mrp = mrp;
// 	if (warranty) updateObj.warranty = warranty;
// 	if (highlights) updateObj.highlights = highlights;

// 	const products = await Product.findOneAndUpdate(
// 		{
// 			addedBy: req.user._id,
// 			_id: id,
// 		},
// 		updateObj,
// 		{ new: true }
// 	);

// 	return res.json({
// 		error: false,
// 		message: 'Product details updated.',
// 		payload: products,
// 	});
// };
// const deleteProductSingle = async (req, res) => {
// 	const { id } = req.params;

// 	const removedProduct = await Product.findOneAndRemove({
// 		addedBy: req.user._id,
// 		_id: id,
// 	});

// 	const products = await Product.find({
// 		addedBy: req.user._id,
// 	});

// 	return res.json({
// 		error: false,
// 		message: 'product deleted successfully',
// 		payload: products,
// 	});
// };
// const getSingleProduct = async (req, res) => {
// 	const { productId } = req.params;

// 	const product = await Product.findOne({
// 		_id: productId,
// 	}).populate(
// 		'addedBy',
// 		'_id shopName name publicPhoneNumber location address timing'
// 	);

// 	return res.json({
// 		error: false,
// 		message: 'product fetched from DB successfully',
// 		payload: product,
// 	});
// };
// const getAllCity = async (req, res) => {
// 	const city = await Product.find().distinct('city');
// 	console.log(city);
// 	return res.json({
// 		error: false,
// 		message: 'all cities',
// 		payload: city,
// 	});
// };
// const getAllProductFromCity = async (req, res) => {
// 	const { cityName } = req.params;
// 	const { page } = req.query;
// 	// console.log({ page });
// 	const options = {
// 		page: page || 1,
// 		limit: 60,
// 		select: {
// 			highlights: 0,
// 			categoryId: 0,
// 			categoryName: 0,
// 			location: 0,
// 			mrp: 0,
// 			rating: 0,
// 			reviews: 0,
// 			isAvaliable: 0,
// 			isFeatured: 0,
// 			stock: 0,
// 			sold: 0,
// 			addedBy: 0,
// 		},
// 		sort: { askedAvailablity: 1 },
// 	};
// 	// console.log({ InOptions: options.page });

// 	const products = await Product.paginate(
// 		{
// 			city: cityName,
// 		},
// 		options
// 	);
// 	// console.log(products);
// 	return res.json({
// 		error: false,
// 		message: 'all products from cities',
// 		payload: products,
// 	});
// };
// const getAllProductOfCategory = async (req, res) => {
// 	// console.log('user');
// 	// console.log(req.user);
// 	// console.log('Profile');
// 	// console.log(req.profile);
// 	const { categoryId } = req.params;
// 	const { page } = req.query;
// 	// console.log({ page });
// 	console.log({ categoryId });
// 	const pageNumber = parseInt(page || 1);
// 	const skipDocuments = (pageNumber - 1) * 10;

// 	const products = await Product.aggregate([
// 		{
// 			$geoNear: {
// 				near: {
// 					type: 'Point',
// 					coordinates: [
// 						req.profile.location.coordinates[0],
// 						req.profile.location.coordinates[1],
// 					],
// 				},
// 				distanceMultiplier: 0.001,
// 				distanceField: 'dist.calculated',
// 				spherical: true,
// 				maxDistance: 50 * 1000,
// 			},
// 		},
// 		{
// 			$match: {
// 				categoryId: {
// 					$eq: mongoose.Types.ObjectId(categoryId),
// 				},
// 			},
// 		},
// 		// {
// 		// 	$project: {
// 		// 		highlights: 0,
// 		// 		categoryId: 0,
// 		// 		categoryName: 0,
// 		// 		location: 0,
// 		// 		mrp: 0,
// 		// 		rating: 0,
// 		// 		reviews: 0,
// 		// 		isAvaliable: 0,
// 		// 		isFeatured: 0,
// 		// 		stock: 0,
// 		// 		sold: 0,
// 		// 		addedBy: 0,
// 		// 	},
// 		// }, // Return all but the specified fields
// 		{ $sort: { createdAt: -1 } },
// 		{
// 			$facet: {
// 				metadata: [{ $count: 'total' }, { $addFields: { page: pageNumber } }],
// 				data: [{ $skip: skipDocuments }, { $limit: 10 }], // add projection here wish you re-shape the docs
// 			},
// 		},
// 	]);
// 	// console.log(products);
// 	// const productAfterPopulate = await Product.populate(products, {
// 	// 	path: 'addedBy',
// 	// 	select: '_id publicPhoneNumber name shopName',
// 	// 	options: { sort: { askedAvailablity: 'desc' } },
// 	// });

// 	// console.log(productAfterPopulate);
// 	// const result = await Product.aggregatePaginate(products, options);
// 	return res.json({
// 		error: false,
// 		message: `fetched all products of ${categoryId}`,
// 		payload: products,
// 	});
// };
module.exports = {
	addProduct,
	getSingleProduct,
	updateProduct,
	addVariant,
	getAllProducts,
	addAttribute,
	getNewArrivalProducts,
	getFilters,
	getBestSellerProducts,
	deleteProduct,
	getAllAdminProducts,
	addQuickProduct,
};
