const express = require("express");
const router = express.Router();
const dynamicController = require("../../controller/dynamic");
const check = require("../../utils/checkRole");
const passport = require("passport");
const { body, validationResult } = require("express-validator");

//      @type       POST
//      @route      /api/v1/offer/add
//      @access     PRIVATE ADMIN
router.post(
	"/add",
	passport.authenticate("admin-rule", { session: false }),
	dynamicController.addDynamicContent
);

//      @type       POST
//      @route      /api/v1/offer/edit/:id
//      @access     PRIVATE ADMIN
router.post(
	"/edit/:id",
	passport.authenticate("admin-rule", { session: false }),
	dynamicController.editDynamicContent
);

//      @type       GET
//      @route      /api/v1/offer/get/all
//      @access     PRIVATE USER
router.get(
	"/get/all",
	// passport.authenticate("admin-rule", { session: false }),
	dynamicController.fetchData
);

//      @type       DELETE
//      @route      /api/v1/offer/remove/:id
//      @access     PRIVATE ADMIN
router.delete(
	"/remove/:id",
	// passport.authenticate('admin-rule', { session: false }),
	dynamicController.removeData
);

module.exports = router;
