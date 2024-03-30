const express = require('express');
const router = express.Router();
const productController = require('../../controller/product');
const check = require('../../utils/checkRole');
const passport = require('passport');
const upload = require('../../middleware/upload');
const { body, validationResult } = require('express-validator');
const { attachShopId } = require('../../middleware/middlewares');

router.post(
	'/add/:shopId',
	[
		body('name').exists().trim(),
		body('description').exists().trim(),
		body('stock').exists().trim(),
	],
	passport.authenticate('shop-rule', { session: false }),
	attachShopId,
	productController.addProduct
);
router.post(
	'/quick-add',
	[body('name').exists().trim(), body('stock').exists().trim()],
	passport.authenticate('shop-rule', { session: false }),
	attachShopId,
	productController.addQuickProduct
);
router.get('/detail/:productId', productController.getSingleProduct);
router.get('/all/:shopId', productController.getAllProducts);
router.get(
	'/admin/all',
	passport.authenticate('shop-rule', { session: false }),
	attachShopId,
	productController.getAllAdminProducts
);
// router.get('/filters/:shopId', productController.getFilters);
router.post(
	'/edit/:productId',
	[
		body('name').exists().trim(),
		body('description').exists().trim(),
		body('stock').exists().trim(),
	],
	passport.authenticate('shop-rule', { session: false }),
	attachShopId,
	productController.updateProduct
);
router.delete(
	'/delete/:productId',
	passport.authenticate('shop-rule', { session: false }),
	productController.deleteProduct
);
router.post(
	'/add/variant/:productId',
	passport.authenticate('shop-rule', { session: false }),
	productController.addVariant
);
router.post(
	'/add/attribute/:productId',
	passport.authenticate('shop-rule', { session: false }),
	productController.addAttribute
);
router.get(
	'/get-new-arrivals-product/:shopId',
	productController.getNewArrivalProducts
);
router.get(
	'/get-best-seller-product/:shopId',
	productController.getBestSellerProducts
);
module.exports = router;
