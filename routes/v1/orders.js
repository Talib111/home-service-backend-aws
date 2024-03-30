const express = require("express");
const router = express.Router();
const orderController = require("./../../controller/order");
const check = require("../../utils/checkRole");
const passport = require("passport");
const upload = require("../../middleware/upload");
const { body, validationResult } = require("express-validator");

router.get(
	"/create",
	check.checkIfAuthenticated,
	check.checkIfProfile,
	orderController.createOrder
);

router.post(
	"/verify",
	check.checkIfAuthenticated,
	check.checkIfProfile,
	orderController.serverVerify
);
router.post(
	"/confirm-order-offline",
	check.checkIfAuthenticated,
	check.checkIfProfile,
	orderController.cofirmOrderOffline
);

router.post(
	"/cancel/:id",
	check.checkIfAuthenticated,
	check.checkIfProfile,
	orderController.cancelOrder
);

router.get(
	"/all",
	check.checkIfAuthenticated,
	check.checkIfProfile,
	orderController.getAllOrders
);
router.get(
	"/detail/:id",
	check.checkIfAuthenticated,
	check.checkIfProfile,
	orderController.getOrderDetail
);
module.exports = router;
