// crud for couponCode model
const CouponCode = require("../model/v1/couponCode.model");
const Joi = require("joi");

const PostCouponCode = async (req, res) => {
	const { discount, discountType, code } = req.body;

	// auto generate code Like "COUPON-1234"
	// const code = `COUPON-${Math.floor(1000 + Math.random() * 9000)}`;

	// validation
	const schema = Joi.object({
		code: Joi.string().required().messages({
			"string.base": "Code must be a string",
			"any.required": "Code is required",
			"string.empty": "Code must not be empty",
		}),
		discount: Joi.number().required().messages({
			"number.base": "Discount must be a number",
			"any.required": "Discount is required",
			"number.empty": "Discount must not be empty",
		}),
		// discountType: Joi.string().valid("percentage", "amount").messages({
		// 	"any.required": "Discount type is required",
		// 	"any.only": "Discount type must be percentage or amount",
		// 	"string.empty": "Discount type must not be empty",
		// }),
	});

	const { error } = schema.validate(req.body);
	if (error) {
		return res
			.status(400)
			.json({ success: false, message: error.details[0].message });
	}

	// already exist or not check by code
	const codeExist = await CouponCode.findOne({ code }).select("code").lean();
	if (codeExist) {
		return res
			.status(400)
			.json({ success: false, message: "Code already exist" });
	}

	try {
		const couponCode = new CouponCode({
			code,
			discount,
			discountType,
		});

		const data = await couponCode.save();
		return res.status(201).json({
			success: true,
			data,
			message: "Created successfully",
		});
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

const GetAllCouponCode = async (req, res) => {
	const { page = 1, limit = 10, q } = req.query;
	try {
		const options = {
			page: parseInt(page, 10),
			limit: parseInt(limit, 10),
			sort: {
				createdAt: -1,
			},
		};
		let query = [
			{
				$match: {
					status: "1",
				},
			},
			{
				$project: {
					code: 1,
					discount: 1,
					discountType: 1,
					status: 1,
					createdAt: 1,
				},
			},
		];
		if (q) {
			query.unshift({
				$match: {
					$or: [
						{ code: { $regex: q, $options: "i" } },
						{ discountAmount: { $regex: q, $options: "i" } },
						{ discountType: { $regex: q, $options: "i" } },
					],
				},
			});
		}
		const aggregateData = CouponCode.aggregate(query);
		const getAllCouponCode = await CouponCode.aggregatePaginate(
			aggregateData,
			options
		);
		if (!getAllCouponCode) {
			return res
				.status(404)
				.json({ success: false, message: "No record found" });
		}
		return res.status(200).json({
			success: true,
			...getAllCouponCode,
		});
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

// get data by id
const GetCouponCodeById = async (req, res) => {
	const { id } = req.params;
	try {
		const couponCode = await CouponCode.findById(id);
		if (!couponCode) {
			return res
				.status(404)
				.json({ success: false, message: "No record found" });
		}
		return res.status(200).json({ success: true, couponCode });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

// update data
const UpdateCouponCode = async (req, res) => {
	const { id, discount, discountType } = req.body;

	// validation
	const schema = Joi.object({
		id: Joi.string().required(),
		discount: Joi.number().required(),
		discountType: Joi.string().valid("percentage", "amount").messages({
			"any.required": "Discount type is required",
			"any.only": "Discount type must be percentage or amount",
			"string.empty": "Discount type must not be empty",
		}),
	});

	const { error } = schema.validate(req.body);
	if (error) {
		return res
			.status(400)
			.json({ success: false, message: error.details[0].message });
	}

	try {
		const couponCode = await CouponCode.findByIdAndUpdate(
			id,
			{
				discount,
				...(discountType && { discountType }),
			},
			{ new: true }
		);
		if (!couponCode) {
			return res
				.status(404)
				.json({ success: false, message: "Coupon code not found" });
		}
		return res.status(200).json({
			success: true,
			couponCode,
			message: "Updated successfully",
		});
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

// status update active/inactive
const UpdateCouponCodeStatus = async (req, res) => {
	const { id, status } = req.body;

	const schema = Joi.object({
		id: Joi.string().required(),
		status: Joi.string().required(),
	});

	const { error } = schema.validate(req.body);
	if (error) {
		return res
			.status(400)
			.json({ success: false, message: error.details[0].message });
	}

	try {
		const couponCode = await CouponCode.findByIdAndUpdate(
			id,
			{
				status,
			},
			{ new: true }
		);
		if (!couponCode) {
			return res
				.status(404)
				.json({ success: false, message: "Coupon code not found" });
		}
		return res.status(200).json({
			success: true,
			couponCode,
			message: status == "1" ? "Activated" : "Deactivated",
		});
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

// get coupon data by code
const GetCouponCodeByCode = async (req, res) => {
	const { code } = req.params;
	try {
		// if status is 0 then not found coupon code

		const couponCode = await CouponCode.findOne({ code })
			.select("code discount discountType status createdAt updatedAt")
			.lean();

		// if status is 0 then not found coupon code
		if (couponCode?.status == "0") {
			return res
				.status(404)
				.json({ success: false, message: "Invalid coupon code" });
		}

		if (!couponCode) {
			return res
				.status(404)
				.json({ success: false, message: "Coupon code not found" });
		}
		return res.status(200).json({ success: true, couponCode });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

module.exports = {
	PostCouponCode,
	GetAllCouponCode,
	GetCouponCodeById,
	UpdateCouponCode,
	UpdateCouponCodeStatus,
	GetCouponCodeByCode,
};
