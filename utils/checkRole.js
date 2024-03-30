const User = require("../model/v1/User");
const admin = require("./firebase");
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;
exports.requiresSuperAdmin = (req, res, next) => {
	if (!req.user.isSuperAdmin) {
		// console.log(req.user);
		return res.status(401).json({
			error: true,
			message: "You are not allowed to perform this action",
		});
	} else {
		next();
	}
};
exports.requireRole = (ROLE) => {
	return (req, res, next) => {
		// console.log({ USER: req.user });
		if (req.user.roles.includes(ROLE)) {
			return next();
		}
		return res.status(401).json({
			error: true,
			message: "You do not have role to perform this action",
		});
	};
};
exports.requiresAdmin = (req, res, next) => {
	if (req.user.defaultRole !== 10) {
		// console.log(req.user);
		return res.status(401).json({
			error: true,
			message: "You are not allowed to perform this action",
		});
	} else {
		next();
	}
};

const getAuthToken = (req, res, next) => {
	console.log("headers :  ");
	console.log(req.headers);

	if (
		req.headers.authorization &&
		req.headers.authorization.split(" ")[0] === "Bearer"
	) {
		// console.log('Authorization :  ' + req.headers.authorization);
		req.authToken = req.headers.authorization.split(" ")[1];
	} else {
		req.authToken = null;
	}
	next();
};

exports.checkIfAuthenticated = (req, res, next) => {
	getAuthToken(req, res, async () => {
		try {
			const { authToken } = req;
			console.log(authToken);
			const verify = jwt.verify(authToken, secret);
			console.log({ verify });
			// const userInfo = await admin.auth().verifyIdToken(authToken);
			// console.log('userInfo');
			// console.log(userInfo);
			req.authId = verify.userId;
			req.mobileNumber = verify.mobileNumber;
			req.user = verify;
			// req.user = userInfo;
			next();
		} catch (e) {
			console.log({ e });
			return res.status(401).json({
				error: true,
				message: "Please Signin again, your token is expired!",
			});
		}
	});
};

exports.checkIfProfile = async (req, res, next) => {
	console.log(req.authId);
	console.log({
		_id: req.authId,
		mobileNumber: req.mobileNumber,
		user: req.user,
	});
	const profile = await User.findOne({
		_id: req.authId,
		mobileNumber: req.mobileNumber,
	});
	console.log("profile " + profile);
	if (!profile)
		return res.json({
			error: true,
			message: "Something wents wrong, Please try after sometime",
		});
	// if (!profile.isProfileComplete) {
	// 	console.log("Please create your Profile");
	// 	return (
	// 		res
	// 			// .status(401)
	// 			.json({
	// 				error: true,
	// 				message: "Please create your Profile",
	// 				profile: false,
	// 			})
	// 			.end()
	// 	);
	// } else {
	req.profile = profile;
	return next();
	// }
};
