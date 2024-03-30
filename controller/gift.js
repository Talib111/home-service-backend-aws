const Gift = require('../model/v1/Gift');
const GiftOrder = require('../model/v1/GiftOrder');
const Profile = require('../model/v1/Profile');
const cloudinary = require('cloudinary').v2;

const addGift = async (req, res) => {
	try {
		const { name, description, coinNeeded, stock, imageUrl } = req.body;

		const gift = await new Gift({
			name,
			description,
			coinNeeded,
			stock,
			addedBy: req.user._id,
			imageUrl,
		}).save();

		if (!gift)
			return res.json({
				error: true,
				message: 'unable to add gift',
			});

		return res.json({
			error: false,
			message: 'gift added successfully',
			payload: gift,
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

const getGiftss = async (req, res) => {
	const gifts = await Gift.find().select(
		'name description imageUrl coinNeeded stock isAvailable'
	);
	if (!gifts)
		return res.json({
			error: true,
			message: 'Something wents wrong, Please try after sometime',
		});
	return res.json({
		error: false,
		message: 'all gifts',
		payload: gifts,
	});
};

const redeemGift = async (req, res) => {
	const { uid } = req.user;
	const { giftId } = req.params;
	const profile = await Profile.findOne({ uid });
	const gift = await Gift.findById({ _id: giftId });
	// console.log(gift);
	// console.log(req.user);
	// console.log(profile);
	console.log(profile.coins);
	console.log(gift.coinNeeded);
	if (profile.coins > gift.coinNeeded) {
		const afterDeduct = await Profile.findOneAndUpdate(
			{
				uid,
			},
			{
				$inc: {
					coins: -gift.coinNeeded,
				},
			},
			{ new: true }
		);

		if (!afterDeduct)
			return res.json({
				error: true,
				message: 'Something wents wrong, Please try after sometime',
			});

		const order = await new GiftOrder({
			addedBy: profile._id,
			giftId: gift._id,
			order_status: 'ordered',
		}).save();
		if (!order)
			return res.json({
				error: true,
				message: 'Something wents wrong, Please try after sometime',
			});

		return res.json({
			error: false,
			message: 'gift ordered successfully',
			payload: order,
		});
	} else {
		const coinNeeded = gift.coinNeeded - profile.coins;
		return res.json({
			error: true,
			message: `You need ${coinNeeded} more coins`,
		});
	}
};

const getOrders = async (req, res) => {
	console.log(req.user);
	console.log(req.profile);
	const orders = await Orders.find({ userId: req.profile._id }).populate(
		'giftId addedBy'
	);

	return res.json({
		error: false,
		message: 'orders',
		payload: orders,
	});
};

module.exports = {
	addGift,
	getGiftss,
	redeemGift,
	getOrders,
};
