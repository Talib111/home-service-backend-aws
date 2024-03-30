const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShopSchema = new Schema(
	{
		// unique ENV value in blocks
		name: {
			type: String,
			required: true,
			unique: true,
		},
		shopName: {
			type: String,
			required: true,
		},
		ownerId: {
			type: Schema.Types.ObjectId,
			ref: 'seller',
		},
		url: {
			type: String,
			required: true,
		},
		customerCareNumber: Number,
		chatId: Number,
		library: [
			{
				title: String,
				discount: Number,
				image: String,
			},
		],
		videos: {
			type: Array,
		},
		isOnlinePayment: {
			type: Boolean,
			default: false,
		},
		products: [
			{
				product: {
					type: Schema.Types.ObjectId,
					ref: 'product',
				},
				category: {
					type: Schema.Types.ObjectId,
					ref: 'category',
				},
			},
		],
		logo: String,
		stickyText: String,
		address: String,
		email: String,
		categories: [
			{
				type: Schema.Types.ObjectId,
				ref: 'category',
			},
		],
		featureProducts: [
			{
				type: Schema.Types.ObjectId,
				ref: 'product',
			},
		],
		departments: [
			{
				type: Schema.Types.ObjectId,
				ref: 'department',
			},
		],
		offers: [
			{
				type: Schema.Types.ObjectId,
				ref: 'department',
			},
		],

		testionmials: [
			{
				userImage: String,
				title: String,
				name: String,
				count: Number,
			},
		],

		theme: String,
		websiteType: {
			home: Number,
			header: Number,
			detail: Number,
		},
		showComingSoon: Boolean,

		// according to website
		header: {
			main: String,
			points: [
				{
					name: String,
					href: String,
				},
			],
		},

		mainHeaders: [
			{
				name: String,
				href: String,
			},
		],
		socialSites: [
			{
				image: String,
				url: String,
				title: String,
			},
		],
		banner: [
			{
				title: String,
				subtitle: String,
				actionUrl: String,
				actionText: String,
				image: String,
				order: Number,
			},
		],
		discoverSection: [
			{
				title: String,
				subTitle: String,
				actionUrl: String,
				image: String,
				actionText: String,
			},
		],
		discountSection: {
			title: String,
			subTitle: String,
			actionUrl: String,
			actionText: String,
			secondaryActionUrl: String,
			secondaryActionText: String,
			image: String,
		},
		offerSection: {
			title: String,
			subTitle: String,
			actionUrl: String,
			image: String,
			actionText: String,
		},
		emailSection: {
			title: String,
			subTitle: String,
			image: String,
			points: [],
		},
		footer: [
			{
				title: String,
				points: [
					{
						url: String,
						text: String,
					},
				],
			},
		],
	},
	{
		timestamps: true,
	}
);

module.exports = Shop = mongoose.model('shop', ShopSchema);
