const Product = require('../model/v1/Product');
const { getDistance, orderByDistance } = require('geolib/es');

// const searchData = async (req, res) => {
// 	try {
// 		const { searchdata } = req.params;

// 		// console.log(req.user);

// 		const data = await Product.find({
// 			$or: [
// 				{ name: { $regex: searchdata, $options: 'i' } },
// 				{ description: { $regex: searchdata, $options: 'i' } },
// 				{ categoryName: { $regex: searchdata, $options: 'i' } },
// 				{ highlights: { $regex: searchdata, $options: 'i' } },
// 			],
// 		});
// 		console.log('Profile');
// 		console.log(req.profile);

// 		// console.log(data);
// 		// const productLatLong = await data.forEach()
// 		console.log({
// 			lat: req.profile.latitude,
// 			long: req.profile.longitude,
// 			coins: req.profile.coins,
// 		});
// 		const nearsetProduct = orderByDistance(
// 			{
// 				latitude: parseInt(req.profile.latitude),
// 				longitude: parseInt(req.profile.longitude),
// 			},
// 			data
// 		);
// 		let addDistance = null;
// 		var promise = new Promise((resolve, reject) => {
// 			addDistance = nearsetProduct.forEach(async (product, index, array) => {
// 				product.distanceFromShop = getDistance(
// 					{
// 						latitude: parseInt(req.profile.latitude),
// 						longitude: parseInt(req.profile.longitude),
// 					},
// 					{
// 						latitude: parseInt(product.latitude),
// 						longitude: parseInt(product.longitude),
// 					}
// 				);

// 				console.log(
// 					getDistance(
// 						{
// 							latitude: parseInt(req.profile.latitude),
// 							longitude: parseInt(req.profile.longitude),
// 						},
// 						{
// 							latitude: parseInt(product.latitude),
// 							longitude: parseInt(product.longitude),
// 						}
// 					)
// 				);

// 				if (index === array.length - 1) resolve();
// 			});
// 		});

// 		promise
// 			.then(() => {
// 				// console.log('nearest product');
// 				// console.log(nearsetProduct);

// 				console.log('Distance');

// 				console.log(addDistance);

// 				return res.json({
// 					error: false,
// 					message: 'Search Result',
// 					data,
// 				});
// 			})
// 			.catch((err) => {
// 				console.log(err);
// 			});
// 	} catch (error) {
// 		console.log(error);
// 		return res.json({
// 			error: true,
// 			message: 'Oops, something went wrong',
// 		});
// 	}
// };
const searchData = async (req, res) => {
	try {
		const { text } = req.query;
		const { shopId } = req.params;
		console.log({ text, shopId });
		// console.log(req.profile);
		// console.log('locationRadius    ' + locationRadius);

		// const data = await Product.find({
		// 	$or: [
		// 		{ name: { $regex: searchdata, $options: 'i' } },
		// 		{ description: { $regex: searchdata, $options: 'i' } },
		// 		{ categoryName: { $regex: searchdata, $options: 'i' } },
		// 		{ highlights: { $regex: searchdata, $options: 'i' } },
		// 	],
		// 	location: {
		// 		$near: {
		// 			$maxDistance: locationRadius * 1000,
		// 			$geometry: {
		// 				type: 'Point',
		// 				coordinates: [
		// 					req.profile.location.coordinates[0],
		// 					req.profile.location.coordinates[1],
		// 				],
		// 			},
		// 		},
		// 	},
		// });

		// Product.aggregate(
		// 	[
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
		// 				maxDistance: locationRadius * 1000,
		// 			},
		// 		},

		// 		{
		// 			$match: {
		// 				$or: [
		// 					{ name: { $regex: searchdata, $options: 'i' } },
		// 					{ description: { $regex: searchdata, $options: 'i' } },
		// 					{ categoryName: { $regex: searchdata, $options: 'i' } },
		// 					{ highlights: { $regex: searchdata, $options: 'i' } },
		// 				],
		// 			},
		// 		},
		// 	],
		// 	function (err, results) {
		// 		if (err) console.log(err);
		// 		console.log(results);
		// 		return res.json({
		// 			error: false,
		// 			message: 'Search Result',
		// 			data: results,
		// 		});
		// 	}
		// );
		// console.log('Profile');
		// console.log(req.profile);
		const products = await Product.find({
			$text: { $search: text },
			shopId: shopId,
		});
		return res.json({
			error: false,
			message: 'search data',
			payload: products,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: 'Oops, something went wrong',
		});
	}
};
const searchProductsWebsite = async (req, res) => {
	try {
		const { lat, long, searchKeyword, locationRadius } = req.body;
		console.log(req.body);
		const { page } = req.query;
		console.log({ page });
		const pageNumber = parseInt(page || 1);
		const skipDocuments = (pageNumber - 1) * 10;

		const products = await Product.aggregate([
			{
				$geoNear: {
					near: {
						type: 'Point',
						coordinates: [long, lat],
					},
					distanceMultiplier: 0.001,
					distanceField: 'dist.calculated',
					spherical: true,
					maxDistance: locationRadius * 1000,
				},
			},

			{
				$match: {
					$or: [
						{ name: { $regex: searchKeyword, $options: 'i' } },
						{ description: { $regex: searchKeyword, $options: 'i' } },
						{ categoryName: { $regex: searchKeyword, $options: 'i' } },
						{ highlights: { $regex: searchKeyword, $options: 'i' } },
					],
				},
			},

			{
				$project: {
					highlights: 0,
					categoryId: 0,
					categoryName: 0,
					location: 0,
					mrp: 0,
					rating: 0,
					reviews: 0,
					isAvaliable: 0,
					isFeatured: 0,
					stock: 0,
					sold: 0,
					addedBy: 0,
				},
			},
			{ $sort: { askedAvailablity: -1 } },
			{
				$facet: {
					metadata: [{ $count: 'total' }, { $addFields: { page: pageNumber } }],
					data: [{ $skip: skipDocuments }, { $limit: 10 }], // add projection here wish you re-shape the docs
				},
			},
		]);

		return res.json({
			error: false,
			message: 'Search Result',
			data: products,
		});
		// console.log('Profile');
		// console.log(req.profile);
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: 'Oops, something went wrong',
		});
	}
};

const searchText = async (req, res) => {
	const { text } = req.params;

	try {
		const data = await Product.find({
			$or: [
				{ name: { $regex: text, $options: 'i' } },
				{ description: { $regex: text, $options: 'i' } },
				{ categoryName: { $regex: text, $options: 'i' } },
			],
		});

		return res.json({
			error: false,
			message: 'Suggested Products and categories',
			data,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: 'Oops, something went wrong',
		});
	}
};

module.exports = {
	searchData,
	searchText,
	searchProductsWebsite,
};
