const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { body, validationResult } = require("express-validator");
const { customAlphabet } = require("nanoid");
const { IS_PRODUTION } = require("../utils/constants");
const OTP = require("../model/v1/OTP");
const User = require("../model/v1/User");
const axios = require("axios");

// global function
const secret = process.env.SECRET;

// const signUp = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       console.log(errors.array());
//       return res.json({ error: true, message: errors.array()[0].msg });
//     }

//     const { name, email, password, confirmPassword } = req.body;
//     console.log(req.body);
//     if (!name || !email || !password || !confirmPassword) {
//       console.log(req.body);
//       return res.json({
//         error: true,
//         message: 'please provide all fields',
//       });
//     }

//     if (password !== confirmPassword)
//       return res.json({
//         error: true,
//         message: 'both password shoudl have to be same',
//       });

//     const user = await User.findOne({ email: email });

//     if (user) {
//       return res.json({
//         error: true,
//         message: 'Account already exist, please sign in',
//       });
//     }

//     // NO ACCOUNT FOUND

//     const salt = await bcrypt.genSalt(10);
//     const hash = await bcrypt.hash(password, salt);

//     const newUSer = await new User({
//       name,
//       email,
//       password: hash,
//     }).save();

//     if (!newUSer) {
//       return res.json({
//         error: true,
//         message: 'Account cannot be created',
//       });
//     }

//     return res.json({
//       message: 'Account Created successfully',
//     });
//   } catch (error) {
//     console.log(error);
//     return res.json({
//       error: true,
//       message: 'Oops, something went wrong',
//     });
//   }
// };

const signIn = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({ error: true, message: errors.array()[0].msg });
		}

		const { mobileNumber, pin, fcmToken } = req.body;
		if (!mobileNumber || !pin) {
			return res.json({
				error: true,
				message: "Incomplete Details",
			});
		}

		const user = await User.findOne({ mobileNumber });

		if (!user)
			return res.json({
				error: true,
				message: "User not found",
			});

		// MATCH USER ENRCYPTED PASSWORD
		const isMatched = await bcrypt.compare(pin, user.password);
		if (!isMatched)
			return res.json({
				error: true,
				message: "Pin does not matched",
			});

		const updatedToken = await User.findOneAndUpdate(
			{
				_id: user._id,
			},
			{
				deviceId: fcmToken,
			}
		);

		//Pin MATCHED
		const bearerToken = jwt.sign(
			{
				mobileNumber: updatedToken.mobileNumber,
				userId: updatedToken._id,
			},
			secret,
			{
				expiresIn: "30d",
			}
		);

		return res.json({
			error: false,
			message: "OTP verified",
			payload: {
				token: bearerToken,
				isUserProfileExists: user.isProfileComplete,
				userId: updatedToken._id,
			},
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};

const sendOtp = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({ error: true, message: errors.array()[0].msg });
		}

		const { mobileNumber, isSignup } = req.body;
		console.log(req.body);
		if (!mobileNumber || mobileNumber.trim().length < 10) {
			return res.json({
				error: true,
				message: "please provide correct number",
			});
		}
		if (isSignup) {
			const isMobileNumberUsed = await User.findOne({ mobileNumber });
			if (isMobileNumberUsed)
				return res.json({
					error: true,
					message: "Mobile number is already used, please signin",
				});
		}
		const otp = IS_PRODUTION
			? Math.floor(1000 + Math.random() * 900000)
			: "123456";
		console.log({
			IS_PRODUTION,
		});
		console.log({ otp });
		// TODO only do in the PRODUCTION
		// const isMessageSend = await axios.get(
		// 	"https://www.fast2sms.com/dev/bulkV2",
		// 	{
		// 		params: {
		// 			authorization: "YOUR_API_KEY",
		// 			variables_values: otp,
		// 			route: "otp",
		// 			numbers: mobileNumber,
		// 		},
		// 		headers: {
		// 			"cache-control": "no-cache",
		// 		},
		// 	}
		// );
		// console.log({
		// 	isMessageSend,
		// });
		// if (!isMessageSend)
		// 	return res.json({
		// 		error: true,
		// 		message: "Something wents wrong, Please try after sometime",
		// 	});

		const removeOldRequest = await OTP.deleteMany({ mobileNumber });
		console.log({ removeOldRequest });
		const otpModel = await new OTP({
			mobileNumber,
			otp,
			expiryTime: moment(new Date()).add("30", "minutes"),
		}).save();
		console.log({ otpModel });
		const token = jwt.sign(
			{
				mobileNumber,
				id: otpModel._id,
			},
			secret,
			{
				expiresIn: "1h",
			}
		);

		// TODO sent an otp to mobile number
		// TODO
		// TODO

		return res.json({
			error: false,
			message: "OTP sent to mobile number",
			payload: token,
		});
	} catch (error) {
		console.log(error);
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const verifyOtp = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({ error: true, message: errors.array()[0].msg });
		}

		const { otp, token } = req.body;
		const verified = jwt.verify(token, secret);
		console.log({ verified });
		if (!verified)
			return res.json({
				error: true,
				message: "Invalid Signature, Please Send OTP again",
			});
		const { id, mobileNumber } = verified;
		console.log(req.body);
		if (!otp || otp.trim().length < 4) {
			return res.json({
				error: true,
				message: "please provide correct OTP",
			});
		}
		if (!id) {
			return res.json({
				error: true,
				message: "Something went wrong",
			});
		}

		const otpModel = await OTP.findOne({
			_id: id,
			mobileNumber,
		});
		console.log({ otpModel });

		if (!otpModel)
			return res.json({
				error: true,
				message: "Not Found",
			});

		const currentDateTime = moment();
		const expiryDateTime = moment(otpModel.expiryTime);

		if (otpModel.isVerified)
			return res.json({
				error: true,
				message: "OTP is already verified, please Send OTP again",
			});

		if (otpModel.otpVerificationTried > 3)
			return res.json({
				error: true,
				message: "Maximum number of verification failed, please send OTP again",
			});

		if (currentDateTime.isAfter(expiryDateTime))
			return res.json({
				error: true,
				message: "OTP is expired, please send OTP again",
			});

		if (otpModel.otp !== Number(otp)) {
			await OTP.findOneAndUpdate(
				{
					_id: id,
				},
				{ $inc: { otpVerificationTried: 1 } }
			);
			return res.json({
				error: true,
				message: "OTP is not correct",
			});
		}

		const otpModelUpdate = await OTP.findOneAndUpdate(
			{
				_id: id,
			},
			{
				isVerified: true,
			}
		);

		const pinToken = jwt.sign(
			{
				mobileNumber,
				otpId: otpModelUpdate._id,
			},
			secret,
			{
				expiresIn: "15min",
			}
		);
		return res.json({
			error: false,
			message: "OTP verified",
			payload: {
				token: pinToken,
			},
		});
	} catch (error) {
		console.log({ error });
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};
const createPin = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors.array());
			return res.json({ error: true, message: errors.array()[0].msg });
		}

		const { pin, token } = req.body;
		const verified = jwt.verify(token, secret);
		console.log({ verified });
		if (!verified)
			return res.json({
				error: true,
				message: "Invalid Signature, Please Send OTP again",
			});
		const { otpId, mobileNumber } = verified;
		console.log(req.body);
		if (!otpId || otpId.trim().length < 4) {
			return res.json({
				error: true,
				message: "please provide correct OTP ID",
			});
		}
		if (!mobileNumber) {
			return res.json({
				error: true,
				message: "Something went wrong",
			});
		}

		const otpModel = await OTP.findOne({
			_id: otpId,
			mobileNumber,
		});
		console.log({ otpModel });

		if (!otpModel)
			return res.json({
				error: true,
				message: "Not Found",
			});

		if (!otpModel.isVerified)
			return res.json({
				error: true,
				message: "OTP is not verified, please Send OTP again",
			});

		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(pin, salt);

		const isUser = await User.findOne({ mobileNumber });
		let user = null;
		if (!isUser) {
			//  create User
			user = await new User({
				mobileNumber,
				isVerified: true,
				isActive: true,
				password: hash,
			}).save();
		} else {
			user = await User.findOneAndUpdate(
				{ mobileNumber },
				{
					isVerified: true,
					isActive: true,
					password: hash,
				}
			);
		}
		// const bearerToken = jwt.sign(
		// 	{
		// 		mobileNumber,
		// 		userId: user._id,
		// 	},
		// 	secret,
		// 	{
		// 		expiresIn: "30d",
		// 	}
		// );

		// return res.json({
		// 	error: false,
		// 	message: "OTP verified",
		// 	payload: {
		// 		token: bearerToken,
		// 		isUserProfileExists: user.isProfileComplete,
		// 	},
		// });
		return res.json({
			message: "Account Created successfully",
		});
	} catch (error) {
		console.log({ error });
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	}
};

module.exports = {
	sendOtp,
	verifyOtp,
	createPin,
	signIn,
};
