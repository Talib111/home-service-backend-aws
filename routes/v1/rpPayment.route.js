const express = require("express");
const router = express.Router();
const passport = require("passport");
const RpPayment = require("../../controller/RazorPayPayment");

router.post(
	"/create-order",
	passport.authenticate("admin-rule", { session: false }),
	RpPayment.createOrder
);

router.post(
	"/capture-payment",
	// passport.authenticate("admin-rule", { session: false }),
	RpPayment.capturePayment
);

router.post(
	"/verify-signature",
	// passport.authenticate("admin-rule", { session: false }),
	RpPayment.verifySignature
);

router.post(
	"/refund-payment",
	// passport.authenticate("admin-rule", { session: false }),
	RpPayment.refundPayment
);

router.post(
	"/online-pay/:serviceId",
	passport.authenticate("admin-rule", { session: false }),
	RpPayment.closeWorkByOnline
);

module.exports = router;
