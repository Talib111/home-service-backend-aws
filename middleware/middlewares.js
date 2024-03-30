const Shops = require('../model/v1/Shops');

const attachShopId = async (req, res, next) => {
	const shop = await Shops.findOne({ ownerId: req.user._id });
	// console.log({ shop });
	req.shop = shop;
	next();
};

module.exports = {
	attachShopId,
};
