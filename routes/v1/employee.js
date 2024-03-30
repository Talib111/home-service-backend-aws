const express = require("express");
const router = express.Router();
const employeeController = require("../../controller/employee");
const check = require("../../utils/checkRole");
const passport = require("passport");
const upload = require("../../middleware/upload");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { ROLES } = require("../../utils/Roles");
const createAccountLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour window
	max: 10, // start blocking after 5 requests
	message:
		"Too many accounts created from this IP, please try again after an hour",
});

router.post(
	"/reset-password",
	createAccountLimiter,
	passport.authenticate("admin-rule", { session: false }),
	[
		body("password")
			.exists()
			.trim()
			.isLength({ min: 8 })
			.withMessage("password should have to be atleast 8 char long"),
		body("newPassword")
			.exists()
			.trim()
			.isLength({ min: 8 })
			.withMessage("new password should have to be atleast 8 char long"),
	],
	employeeController.resetPassword
);
router.get(
	"/profile",
	passport.authenticate("admin-rule", { session: false }),
	employeeController.employeeProfile
);
router.get(
	"/all-works",
	passport.authenticate("admin-rule", { session: false }),
	employeeController.employeeBookingList
);
router.get(
	"/past-works",
	passport.authenticate("admin-rule", { session: false }),
	employeeController.employeePastWorks
);
router.post(
	"/close-work/:serviceId",
	passport.authenticate("admin-rule", { session: false }),
	employeeController.closeWork
);
router.post(
	"/reassign-work",
	passport.authenticate("admin-rule", { session: false }),
	employeeController.reassignWork
);

module.exports = router;
