const express = require("express");
const router = express.Router();
const passport = require("passport");
const couponCodeController = require("../../controller/couponCode.controller");

router.post(
	"/add",
	passport.authenticate("admin-rule", { session: false }),
	couponCodeController.PostCouponCode
);

router.get(
	"/get-all",
	passport.authenticate("admin-rule", { session: false }),
	couponCodeController.GetAllCouponCode
);

router.put(
	"/update",
	passport.authenticate("admin-rule", { session: false }),
	couponCodeController.UpdateCouponCode
);

router.put(
	"/update-status",
	passport.authenticate("admin-rule", { session: false }),
	couponCodeController.UpdateCouponCodeStatus
);

router.get(
	"/get-by-code/:code",
	// passport.authenticate("admin-rule", { session: false }),
	couponCodeController.GetCouponCodeByCode
);

router.get(
	"/get-by-id/:id",
	passport.authenticate("admin-rule", { session: false }),
	couponCodeController.GetCouponCodeById
);

module.exports = router;
