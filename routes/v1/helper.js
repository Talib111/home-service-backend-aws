const express = require("express");
const router = express.Router();
const helperController = require("./../../controller/helper");
const check = require("../../utils/checkRole");
const passport = require("passport");
const upload = require("../../middleware/upload");
const { body, validationResult } = require("express-validator");
const sendMail = require("../../utils/mail");

//      @type       POST
//      @route      /api/v1/helper/image/upload
//      @desc       FOR CREATING THE GIFT
//      @access     PRIVATE ADMIN
router.post(
	"/image/upload",
	// passport.authenticate('shop-rule', { session: false }),
	upload.single("image"),
	helperController.uploadProductImage
);
router.post("/send/mail", async (req, res) => {
	try {
		const { name, email, phoneNumber, messages, file } = req.body;
		console.log({
			name,
			email,
			phoneNumber,
			messages,
			file,
		});

		const response = await sendMail({
			name,
			email,
			phoneNumber,
			messages,
			file,
		});
		if (!response)
			return res.json({
				error: true,
				message: "Something wents wrong, Please try after sometime",
			});

		return res.json({
			error: false,
			message: "Submitted",
		});
	} catch (error) {
		console.log({ error });
	}
});

//      @type       POST
//      @route      /api/v1/helper/image/upload/multiple
//      @desc       FOR CREATING THE GIFT
//      @access     PRIVATE ADMIN
router.post(
	"/image/upload/multiple",
	// express.json({
	// 	keepExtensions: true,
	// 	limit: 1024 * 1024 * 1024 * 500 * 1024,
	// 	defer: true,
	// }),
	// passport.authenticate('admin-rule', { session: false }),
	upload.array("image"),
	helperController.uploadProductImageMultiple
);
router.post(
	"/product/image/upload/multiple",
	upload.array("image"),
	helperController.uploadProductImageMultiple
);

module.exports = router;
