const express = require('express');
const router = express.Router();
const searchController = require('./../../controller/search');
const check = require('../../utils/checkRole');
const passport = require('passport');
const upload = require('../../middleware/upload');
const { body, validationResult } = require('express-validator');

//      @type       GET
//      @route      /api/v1/search/products/:shopId
//      @desc       FOR Search Result
//      @access     PUBLIC
router.get(
	'/products/:shopId',
	// check.checkIfAuthenticated,
	// check.checkIfProfile,
	searchController.searchData
);

// //      @type       post
// //      @route      /api/v1/search/data/website
// //      @desc       FOR Search Result
// //      @access     PUBLIC
// router.post('/data/website', searchController.searchProductsWebsite);

// //      @type       GET
// //      @route      /api/v1/search/text/:text
// //      @desc       FOR Search Suggestions
// //      @access     PUBLIC
// router.get(
// 	'/text/:text',
// 	check.checkIfAuthenticated,
// 	check.checkIfProfile,
// 	searchController.searchText
// );

module.exports = router;

// TODO
// Delete user
// fortgot password
// opt verification
