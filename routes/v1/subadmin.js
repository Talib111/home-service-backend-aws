const express = require("express");
const router = express.Router();
const subAdminController = require("../../controller/subadmin");
const check = require("../../utils/checkRole");
const passport = require("passport");
const { body } = require("express-validator");
const { ROLES } = require("../../utils/Roles");

router.post(
	"/create-category",
	passport.authenticate("admin-rule", { session: false }),
	// // check.requireRole(ROLES.CREATE_CATEGORY),
	[
		body("title").trim().exists(),
		body("thumbnail")
			.exists()
			.trim()
			.isLength({ min: 8 })
			.withMessage("password should have to be atleast 8 char long"),
	],
	subAdminController.createCategory
);
router.post(
	"/edit-category/:categoryId",
	passport.authenticate("admin-rule", { session: false }),
	// // check.requireRole(ROLES.CREATE_CATEGORY),
	[
		body("title").trim().exists(),
		body("thumbnail")
			.exists()
			.trim()
			.isLength({ min: 8 })
			.withMessage("password should have to be atleast 8 char long"),
	],
	subAdminController.editCategory
);
router.post(
	"/category/:categoryId/add-package",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.PACKAGE_ROLE),
	[
		body("title").trim().exists(),
		body("subtitle").trim().exists(),
		body("price").trim().exists(),
	],
	subAdminController.addPackage
);
router.post(
	"/category/:categoryId/edit-package/:packageId",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.PACKAGE_ROLE),
	[
		body("title").trim().exists(),
		body("subtitle").trim().exists(),
		body("price").trim().exists(),
		body("image").trim().exists(),
	],
	subAdminController.editPackage
);
router.delete(
	"/category/:categoryId/delete-package/:packageId",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.PACKAGE_ROLE),
	subAdminController.deletePackage
);

//      @type       GET
//      @route      /api/v1/category/get/all
//      @access     Public USER
router.post(
	"/banner/add",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.BANNER_ROLE),
	subAdminController.addBanner
);
//      @type       GET
//      @route      /api/v1/category/get/all
//      @access     Public USER
router.get(
	"/banner/remove/:bannerID",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.BANNER_ROLE),
	subAdminController.removeBanner
);

//      @type       GET
//      @route      /api/v1/category/get/all
//      @access     Public USER
router.get(
	"/all-cart-items",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.CART_ROLE),
	subAdminController.getAllCartItems
);
router.get(
	"/all-unassigned-service",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.CART_ROLE),
	subAdminController.getAllUnAssignedServices
);

router.get(
	"/all-orders",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.ORDER_ROLE),
	subAdminController.getAllOrders
);
router.get(
	"/all-reviews",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.ORDER_ROLE),
	subAdminController.getAllReviews
);
router.get(
	"/all-refund-requests",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.ORDER_ROLE),
	subAdminController.getAllRefundRequests
);
router.get(
	"/category/:id/all-employee",
	passport.authenticate("admin-rule", { session: false }),
	// // check.requireRole(ROLES.ORDER_ROLE),
	subAdminController.getAllEmployeeOfCategory
);
router.get(
	"/order/detail/:id",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.ORDER_ROLE),
	subAdminController.getOrderDetail
);
router.post(
	"/assign-employee-to-order",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.ORDER_ROLE),
	subAdminController.assignEmployeeToOrder
);
router.post(
	"/unassign-employee-to-order",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.ORDER_ROLE),
	subAdminController.unAssignEmployeeToOrder
);
router.post(
	"/add-more-package",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.ADD_MORE_PACKAGE),
	subAdminController.addMorePackageToCart
);
router.post(
	"/reschedule-booking",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.ADD_MORE_PACKAGE),
	subAdminController.rescheduleBooking
);

router.get(
	"/all-users",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.CUSTOMER_ROLE),
	subAdminController.allUsers
);
router.get(
	"/customer/detail/:id",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.CUSTOMER_ROLE),
	subAdminController.getCustomerDetail
);
router.post(
	"/update/customer/detail/:id",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.CUSTOMER_ROLE),
	[
		body("name").trim().exists(),
		body("mobileNumber").trim().exists(),
		body("email").trim().exists(),
		body("pinCode").trim().exists(),
		body("address").trim().exists(),
	],
	subAdminController.updateCustomerDetail
);
router.get(
	"/customer/:id/bookings",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.CUSTOMER_ROLE),

	subAdminController.getCustomerBookings
);
router.post(
	"/update/token",
	passport.authenticate("admin-rule", { session: false }),
	// check.requireRole(ROLES.CUSTOMER_ROLE),

	subAdminController.registerPlatform
);

router.get(
	"/notification",
	passport.authenticate("admin-rule", { session: false }),
	subAdminController.getNotification
);

module.exports = router;
