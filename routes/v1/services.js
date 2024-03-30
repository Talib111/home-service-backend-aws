const express = require("express");
const router = express.Router();
const servicesController = require("../../controller/services");
const check = require("../../utils/checkRole");
const passport = require("passport");
const { body, validationResult } = require("express-validator");
const { attachShopId } = require("../../middleware/middlewares");

//      @type       GET
//      @route      /api/v1/category/get/all
//      @access     Public USER
router.get("/category/get-all", servicesController.getAllCategory);
router.get("/banner/get-all", servicesController.getAllBanners);
//      @type       GET
//      @route      /api/v1/category/get/all
//      @access     Public USER
router.get("/category/detail/:id", servicesController.getCategoryDetail);
router.get("/category/employee-list/:id", servicesController.getEmployeeList);
router.get("/packages/popular", servicesController.getPopularPackages);
router.get("/packages/all", servicesController.getAllPackages);

module.exports = router;
