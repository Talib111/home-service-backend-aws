const express = require('express');
const router = express.Router();
const shopController = require('../../controller/shop');
const check = require('../../utils/checkRole');
const passport = require('passport');
const upload = require('../../middleware/upload');
const { body, validationResult } = require('express-validator');

//      @type       POST
//      @route      /api/v1/shop/signin
//      @desc       FOR LOGIN
//      @access     PUBLIC
router.post(
	'/signin',
	[
		body('phoneNumber').exists().trim(),
		// .isMobilePhone(),
		body('password').exists().isLength({ min: 4 }).trim(),
	],
	shopController.signIn
);

router.post(
	'/banner/add/:shopId',
	[
		body('title').exists().trim(),
		body('subtitle').exists().trim(),
		body('actionUrl').exists().trim(),
		body('image').exists().trim(),
	],
	shopController.bannerAdd
);

router.post(
	'/banner/update/:shopId/:bannerId',
	[
		body('title').exists().trim(),
		body('subtitle').exists().trim(),
		body('actionUrl').exists().trim(),
		body('image').exists().trim(),
	],
	shopController.bannerUpdate
);

router.delete('/banner/delete/:shopId/:bannerId', shopController.bannerRemove);

// discover section
router.post(
	'/discover/add/:shopId',
	[
		body('title').exists().trim(),
		body('subTitle').exists().trim(),
		body('actionUrl').exists().trim(),
		body('image').exists().trim(),
		body('actionText').exists().trim(),
	],
	shopController.discoverAdd
);

router.post(
	'/discover/update/:shopId/:discoverSectionId',
	[
		body('title').exists().trim(),
		body('subTitle').exists().trim(),
		body('actionUrl').exists().trim(),
		body('image').exists().trim(),
		body('actionText').exists().trim(),
	],
	shopController.discoverUpdate
);

router.delete(
	'/discover/delete/:shopId/:discoverSectionId',
	shopController.discoverRemove
);

// socailSites
router.post(
	'/socialsite/add/:shopId',
	[body('image').exists().trim(), body('url').exists().trim()],
	shopController.socialSiteAdd
);

router.post(
	'/socialsite/update/:shopId/:socialSiteId',
	[body('image').exists().trim(), body('url').exists().trim()],
	shopController.socialSiteUpdate
);

router.delete(
	'/socialsite/delete/:shopId/:socialSiteId',
	shopController.socialSiteRemove
);

// headers
router.post(
	'/header/add/:shopId',
	[body('main').exists().trim()],
	shopController.headerAdd
);

router.post('/mainheader/add/:shopId', shopController.mainHeaderAdd);
router.post('/footer/add/:shopId', shopController.footerAdd);
router.post(
	'/review/approved/:productId/:reviewId',
	shopController.approveReview
);

router.post('/emailsection/add/:shopId', shopController.emailSectionAdd);
router.post('/offersection/add/:shopId', shopController.offerSectionAdd);
router.post('/discountsection/add/:shopId', shopController.discountSectionAdd);
router.post('/library/add/:shopId', shopController.librarySectionAdd);
router.post(
	'/review/add/main/:shopId',
	[
		body('userImage').exists().trim(),
		body('title').exists().trim(),
		body('name').exists().trim(),
		body('count').exists().trim(),
	],
	shopController.addReview
);
router.post(
	'/youtube/review/add/:shopId',
	[body('videoId').exists().trim()],
	shopController.addYoutubeVideos
);

router.delete('/library/remove/:shopId/:libraryId', shopController.getOrders);

// router.post('/header/update/:shopId', shopController.headerUpdate);

// //      @type       GET
// //      @route      /api/v1/shop/self
// //      @desc       FOR getting all shop details
// //      @access     PRIVATE
router.get(
	'/self',
	passport.authenticate('shop-rule', { session: false }),
	shopController.getProfile
);
router.get(
	'/get-all-users',
	passport.authenticate('shop-rule', { session: false }),
	shopController.getAllUsers
);

//      @type       GET
//      @route      /api/v1/shop/self
//      @desc       FOR getting all shop details
//      @access     PRIVATE
router.get('/public/details', shopController.getShopPublic);

//! Orders
router.post(
	'/orders/update/payment-status/:shopId/:mongoOrderId',
	[body('paymentStatus').exists().trim()],
	shopController.updatePaymentStatus
);
router.post(
	'/orders/update/delivery-status/:shopId/:mongoOrderId',
	[body('deliveryStatus').exists().trim()],
	shopController.updateDeliveryStatus
);
router.get('/orders/get/:shopId', shopController.getOrders);

module.exports = router;
