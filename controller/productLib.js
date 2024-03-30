const ProductLib = require('../model/v1/ProductLib');
const cloudinary = require('cloudinary').v2;

const addProductLib = async (req, res) => {
	try {
		// console.log(req.user);
		const {
			productName,
			highlights,
			categoryId,
			categoryName,
			description,
			imageLinks,
			mrp,
		} = req.body;
		const parsedHighlists = await JSON.parse(highlights);
		console.log('parsed....');
		console.log(parsedHighlists);
		const productLib = await new ProductLib({
			name: productName,
			highlights: parsedHighlists,
			categoryId,
			categoryName,
			description,
			imageLinks,
			mrp,
			// addedBy: req.user._id,
		}).save();

		if (!productLib)
			return res.json({
				error: true,
				message: 'unable to add productLib',
			});

		return res.json({
			error: false,
			message: 'productLib added successfully',
			payload: productLib,
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

// const editProductLibSingle = async (req, res) => {
//   const { id } = req.params;

//   const {
//     name,
//     description,
//     price,
//     coin,
//     stock,
//     mrp,
//     warranty,
//     highlights,
//   } = req.body;

//   const updateObj = {};

//   if (name) updateObj.name = name;
//   if (description) updateObj.description = description;
//   if (price) updateObj.price = price;
//   if (coin) updateObj.coin = coin;
//   if (stock) updateObj.stock = stock;
//   if (mrp) updateObj.mrp = mrp;
//   if (warranty) updateObj.warranty = warranty;
//   if (highlights) updateObj.highlights = highlights;

//   const productLibs = await ProductLib.findOneAndUpdate(
//     {
//       addedBy: req.user._id,
//       _id: id,
//     },
//     updateObj,
//     { new: true }
//   );

//   return res.json({
//     error: false,
//     message: 'ProductLib details updated.',
//     payload: productLibs,
//   });
// };

const deleteProductLibSingle = async (req, res) => {
	const { id } = req.params;

	const removedProductLib = await ProductLib.findOneAndRemove({
		addedBy: req.user._id,
		_id: id,
	});

	console.log(removedProductLib);

	const productLibs = await ProductLib.find({
		addedBy: req.user._id,
	});

	return res.json({
		error: false,
		message: 'productLib deleted successfully',
		payload: productLibs,
	});
};
const getProductsFromLib = async (req, res) => {
	const { query } = req;
	const { search } = query;
	console.log(search);

	const products = await ProductLib.find({
		$text: { $search: search },
	});

	console.log(products);
	return res.json({
		error: false,
		message: 'all matched products',
		payload: products,
	});
};

module.exports = {
	addProductLib,
	getProductsFromLib,
	deleteProductLibSingle,
};
