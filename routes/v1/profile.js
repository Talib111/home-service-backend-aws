const express = require("express");
const router = express.Router();
const profileController = require("./../../controller/profile");
const check = require("../../utils/checkRole");
const passport = require("passport");
const upload = require("../../middleware/upload");
const { body, validationResult } = require("express-validator");

// router.post(
// 	"/update",
// 	check.checkIfAuthenticated,
// 	[
// 		body("name").trim().exists(),
// 		body("email").trim().exists().isEmail(),
// 		body("address").trim().exists(),
// 		body("pinCode").trim().isNumeric().exists(),
// 	],
// 	profileController.updateProfile
// );
router.post(
	"/update",
	check.checkIfAuthenticated,
	[
		body("name").trim().exists(),
		body("email").trim().exists().isEmail(),
		body("address").trim().exists(),
		body("pinCode").trim().isNumeric().exists(),
		// body("image").exists(),
		// body("gender").trim().exists(),
		body("landmark").trim().exists(),
	],
	profileController.updateProfile
);
router.post(
	"/update/token",
	check.checkIfAuthenticated,
	profileController.updateToken
);

router.post(
	"/add/address",
	check.checkIfAuthenticated,
	check.checkIfProfile,
	profileController.updateDeliveryAddress
);

router.get(
	"/self",
	check.checkIfAuthenticated,
	check.checkIfProfile,
	profileController.getProfile
);
router.get(
	"/notification",
	check.checkIfAuthenticated,
	check.checkIfProfile,
	profileController.getNotification
);

router.get(
	"/payments",
	check.checkIfAuthenticated,
	check.checkIfProfile,
	profileController.getAllPayments
);
router.get(
	"/reviews",
	check.checkIfAuthenticated,
	check.checkIfProfile,
	profileController.getAllReviews
);

router.post(
	"/wishlist/add",
	check.checkIfAuthenticated,
	check.checkIfProfile,
	profileController.addWishlist
);

router.post(
	"/wishlist/remove",
	check.checkIfAuthenticated,
	check.checkIfProfile,
	profileController.removeWishlist
);
// router.post(
// 	"/review/remove",
// 	check.checkIfAuthenticated,
// 	check.checkIfProfile,
// 	profileController.removeReview
// );

router.post(
	"/cart/add",
	check.checkIfAuthenticated,
	check.checkIfProfile,
	profileController.addInCart
);
router.post(
	"/reschedule-booking",
	check.checkIfAuthenticated,
	check.checkIfProfile,
	profileController.rescheduleBooking
);

router.post(
	"/cart/remove",
	check.checkIfAuthenticated,
	check.checkIfProfile,
	profileController.removePackage
);

router.get(
	"/cart/get",
	check.checkIfAuthenticated,
	check.checkIfProfile,
	profileController.getCart
);
router.get(
	"/cart/total/price",
	check.checkIfAuthenticated,
	check.checkIfProfile,
	profileController.getTotalPrice
);

// //      @type       GET
// //      @route      /api/v1/profile/cart/checkout
// //      @desc       FOR CHECKOUT OF THE CART
// //      @access     PRIVATE
// router.get(
// 	'/cart/checkout',
// 	check.checkIfAuthenticated,
// 	check.checkIfProfile,
// 	profileController.checkout
// );

// //      @type       POST
// //      @route      /api/v1/profile/register/device
// //      @desc       FOR REGESTIRING THE Customer DEVICE
// //      @access     PRIVATE
// router.post(
// 	'/register/device',
// 	check.checkIfAuthenticated,
// 	check.checkIfProfile,
// 	profileController.registerPlatform
// );

// //      @type       POST
// //      @route      /api/v1/profile/add/location
// //      @desc       FOR ADDING USER LOCATION
// //      @access     PRIVATE
// router.post(
// 	'/add/location',
// 	check.checkIfAuthenticated,
// 	check.checkIfProfile,
// 	profileController.addLocation
// );

// TODO
//      @type       POST
//      @route      /api/v1/profile/add/location
//      @desc       FOR ADDING USER LOCATION
//      @access     PRIVATE
router.post(
	"/add/review",
	check.checkIfAuthenticated,
	check.checkIfProfile,
	profileController.addReview
);

module.exports = router;
