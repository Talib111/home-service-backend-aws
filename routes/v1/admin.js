const express = require("express");
const router = express.Router();
const adminController = require("./../../controller/admin");
const check = require("../../utils/checkRole");
const passport = require("passport");
const upload = require("../../middleware/upload");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { ROLES } = require("../../utils/Roles");
const { IS_PRODUTION } = require("../../utils/constants");
const createAccountLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour window
	max: IS_PRODUTION ? 10 : 100, // start blocking after 5 requests
	message:
		"Too many accounts created from this IP, please try again after an hour",
});

//      @type       POST
//      @route      /api/v1/admin/signin
//      @desc       FOR LOGIN
//      @access     PUBLIC
router.post(
	"/login",
	createAccountLimiter,
	[
		body("adminId").trim().exists(),
		body("password").exists().trim(),
		// .isLength({ min: 8 })
		// .withMessage("password should have to be atleast 8 char long"),
	],
	adminController.signIn
);

router.post(
	"/add-employee",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.ADD_EMPLOYEE),
	[
		body("firstName")
			.not()
			.isEmpty()
			.trim()
			.escape()
			.isLength({ min: 2 })
			.withMessage("Name is not Valid"),
		body("lastName")
			.not()
			.isEmpty()
			.trim()
			.escape()
			.isLength({ min: 2 })
			.withMessage("Name is not Valid"),
	],
	adminController.addEmployee
);
router.post(
	"/update-employee/:id",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.ADD_EMPLOYEE),
	[
		body("firstName")
			.not()
			.isEmpty()
			.trim()
			.escape()
			.isLength({ min: 2 })
			.withMessage("Name is not Valid"),
		body("lastName")
			.not()
			.isEmpty()
			.trim()
			.escape()
			.isLength({ min: 2 })
			.withMessage("Name is not Valid"),
	],
	adminController.updateEmployee
);
router.post(
	"/add-role",
	passport.authenticate("admin-rule", { session: false }),
	check.requiresSuperAdmin,
	createAccountLimiter,
	[
		body("name")
			.not()
			.isEmpty()
			.trim()
			.escape()
			.isLength({ min: 2 })
			.isUppercase()
			.withMessage("Role Name is not Valid"),
		body("adminId")
			.not()
			.isEmpty()
			.trim()
			.escape()
			.isLength({ min: 2 })
			.withMessage("AdminId need to be present"),
	],
	adminController.addRole
);
router.post(
	"/remove-role",
	passport.authenticate("admin-rule", { session: false }),
	check.requiresSuperAdmin,
	createAccountLimiter,
	[
		body("name")
			.not()
			.isEmpty()
			.trim()
			.escape()
			.isLength({ min: 2 })
			.isUppercase()
			.withMessage("Role Name is not Valid"),
		body("adminId")
			.not()
			.isEmpty()
			.trim()
			.escape()
			.isLength({ min: 2 })
			.withMessage("AdminId need to be present"),
	],
	adminController.removeRole
);

router.post(
	"/employee-password-reset",
	passport.authenticate("admin-rule", { session: false }),
	check.requiresSuperAdmin,
	createAccountLimiter,
	[
		body("newPassword")
			.trim()
			.isLength({ min: 8 })
			.withMessage("password should have to be atleast 8 char long"),
		body("id").trim().exists(),
	],
	adminController.employeePasswordReset
);

router.post(
	"/assign-employee-to-category",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.EMPLOYEE_EDIT_ROLE),
	adminController.assignEmployeeToCategory
);
router.post(
	"/remove-employee-to-category",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.EMPLOYEE_EDIT_ROLE),
	adminController.removeEmployeeToCategory
);
router.get(
	"/all-employee",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.EMPLOYEE_EDIT_ROLE),
	adminController.getAllEmployee
);
router.get(
	"/all-employee-v2",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.EMPLOYEE_EDIT_ROLE),
	adminController.getAllEmployeeV2
);
router.get(
	"/employee/:id",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.EMPLOYEE_EDIT_ROLE),
	adminController.getSingleEmployee
);
router.get(
	"/all-transactions",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.TRANSACTIONS),
	adminController.getAllTranscation
);
router.get(
	"/category/get-all",
	passport.authenticate("admin-rule", { session: false }),
	adminController.getAllCategory
);

router.get(
	"/cash-verification",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.TRANSACTIONS),
	adminController.getAllTranscationbyEmployee
);
router.post(
	"/initiate-refund",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.TRANSACTIONS),
	adminController.initiateRefund
);
router.post(
	"/verify-transaction",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.TRANSACTIONS),
	adminController.verifyTransaction
);
router.post(
	"/raise-dispute",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.TRANSACTIONS),
	adminController.raiseDispute
);
router.post(
	"/accept-cash",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.TRANSACTIONS),
	adminController.acceptCash
);

// get all cart
router.get(
	"/all-cart",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.TRANSACTIONS),
	adminController.getAllCart
);

router.get(
	"/all-refunded",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.TRANSACTIONS),
	adminController.getRefundList
);

router.post(
	"/initiate-refund-offline",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.TRANSACTIONS),
	adminController.initiateRefundOffline
);

// // TODO DISABLE
router.post(
	"/create",
	// passport.authenticate('admin-rule', { session: false }),
	createAccountLimiter,
	[
		body("name")
			.not()
			.isEmpty()
			.trim()
			.escape()
			.isLength({ min: 2 })
			.withMessage("name should have to be atleast 2 char long"),
		body("password")
			.trim()
			.isLength({ min: 8 })
			.withMessage("password should have to be atleast 8 char long"),
		body("adminId").trim(),
	],
	adminController.createAdmin
);

// // TODO DISABLE
// router.post(
// 	"/reset/password/:id",
// 	// passport.authenticate('admin-rule', { session: false }),
// 	createAccountLimiter,
// 	[
// 		body("password")
// 			.trim()
// 			.isLength({ min: 8 })
// 			.withMessage("password should have to be atleast 8 char long"),
// 	],
// 	adminController.reset
// );

module.exports = router;
