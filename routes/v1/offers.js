const express = require('express');
const router = express.Router();
const categoryController = require('../../controller/offer');
const check = require('../../utils/checkRole');
const passport = require('passport');
const { body, validationResult } = require('express-validator');

//      @type       POST
//      @route      /api/v1/offer/add
//      @access     PRIVATE ADMIN
router.post(
	'/add/:shopId',
	// passport.authenticate('admin-rule', { session: false }),
	[body('name').exists()],
	categoryController.addOffer
);

//      @type       POST
//      @route      /api/v1/offer/edit/:id
//      @access     PRIVATE ADMIN
router.post(
	'/edit/:id',
	// passport.authenticate('admin-rule', { session: false }),
	[body('name').exists()],
	categoryController.editOffer
);

//      @type       POST
//      @route      /api/v1/offer/edit/:id
//      @access     PRIVATE ADMIN
router.post(
	'/add/product/:id',
	// passport.authenticate('admin-rule', { session: false }),
	categoryController.addProduct
);

//      @type       POST
//      @route      /api/v1/offer/edit/:id
//      @access     PRIVATE ADMIN
router.post(
	'/remove/product/:id',
	// passport.authenticate('admin-rule', { session: false }),
	categoryController.removeProduct
);

//      @type       GET
//      @route      /api/v1/offer/get/all
//      @access     PRIVATE USER
router.get(
	'/get/all/:shopId',
	// passport.authenticate('shop-rule', { session: false }),
	categoryController.fetchOffer
);
//      @type       GET
//      @route      /api/v1/offer/get/all
//      @access     PRIVATE USER
router.get(
	'/get/products/:offerurl',
	// passport.authenticate('shop-rule', { session: false }),
	categoryController.fetchProductsUsingUrl
);

//      @type       DELETE
//      @route      /api/v1/offer/remove/:id
//      @access     PRIVATE ADMIN
router.delete(
	'/remove/:id',
	// passport.authenticate('admin-rule', { session: false }),
	categoryController.removeOffer
);

module.exports = router;
