const express = require("express");
const router = express.Router();
const authController = require("./../../controller/auth");
const check = require("../../utils/checkRole");
const passport = require("passport");
const upload = require("../../middleware/upload");
const { body, validationResult } = require("express-validator");

//      @type       GET
//      @route      /api/v1/auth/test
//      @desc       FOR TEST
//      @access     PUBLIC
router.get("/test", check.checkIfAuthenticated, (req, res) => {
	return res.json({
		error: false,
		message: "everthing wents ok",
	});
});

// //      @type       POST
// //      @route      /api/v1/auth/signin
// //      @desc       FOR LOGIN
// //      @access     PUBLIC
router.post(
	"/send-otp",
	[
		body("mobileNumber")
			.trim()
			.exists()
			.isNumeric()
			.withMessage("Mobile Number is Required"),
	],
	authController.sendOtp
);
router.post(
	"/verify-otp",
	[body("otp").trim().exists().isNumeric().withMessage("OTP is Required")],
	authController.verifyOtp
);
router.post(
	"/create-pin",
	[body("pin").trim().exists().isNumeric().withMessage("PIN is Required")],
	authController.createPin
);
router.post(
	"/signin",
	[
		body("pin").trim().exists().isNumeric().withMessage("PIN is Required"),
		body("mobileNumber")
			.trim()
			.exists()
			.isNumeric()
			.withMessage("Mobile number is Required"),
	],
	authController.signIn
);

// //      @type       POST
// //      @route      /api/v1/auth/signup
// //      @desc       FOR NEW REGISTER
// //      @access     PUBLIC
// router.post(
//   '/signup',
//   [
//     body('email').isEmail().normalizeEmail(),
//     body('name')
//       .isLength({ min: 2 })
//       .withMessage('name should have to be atleast 2 char long'),
//     body('password')
//       .isLength({ min: 8 })
//       .withMessage('password should have to be atleast 8 char long'),
//     body('confirmPassword')
//       .isLength({ min: 8 })
//       .withMessage('password should have to be atleast 8 char long'),
//   ],
//   authController.signUp
// );

module.exports = router;

// TODO
// Delete user
// fortgot password
// opt verification
