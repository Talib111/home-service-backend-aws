const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const helmet = require("helmet");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const aws = require("aws-sdk");
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const fs = require("fs");
const request = require("request");
const fetch = require("node-fetch");
// var admin = require('firebase-admin');
const rateLimit = require("express-rate-limit");
// var forms = multer();

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100000, // TODO UPDATE IT
});
// const https = require('https');
// const fs = require('fs');
// var key = fs.readFileSync(__dirname + '/' + 'selfsigned.key');
// var cert = fs.readFileSync(__dirname + '/' + 'selfsigned.crt');
// var options = {
// 	key: key,
// 	cert: cert,
// };

// const Sentry = require('@sentry/node');
// const { SitemapStream, streamToPromise } = require('sitemap');
// const { createGzip } = require('zlib');

dotenv.config({ path: ".env" });
aws.config.setPromisesDependency();
aws.config.update({
	accessKeyId: process.env.AWS_IAM_USER_KEY,
	secretAccessKey: process.env.AWS_IAM_USER_SECRET,
	region: process.env.AWS_REGION,
});

// const { setCloudinary } = require('./middleware/cloudinary');
// initalizing app
const app = express();
app.use(helmet());
// app.use(helmet({ contentSecurityPolicy: (process.env.NODE_ENV === 'production') ? undefined : false }));
//! TODO FIX CORS in PROD
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
// app.use(forms.array());
app.use(
	express.urlencoded({
		extended: true,
	})
);
// for environment files

const PORT = process.env.PORT || 8000;
const mongoDbUrl = process.env.mongoDbUrl;

const authRoute = require("./routes/v1/auth");
const adminRoute = require("./routes/v1/admin");
const subAdminRoute = require("./routes/v1/subadmin");
const employeeRoute = require("./routes/v1/employee");
const servicesRoute = require("./routes/v1/services");
const ordersRoute = require("./routes/v1/orders");
const helperRoute = require("./routes/v1/helper");
const profileRoute = require("./routes/v1/profile");
const dynamicRoute = require("./routes/v1/dynamic");
const categoryRoute = require("./routes/v1/services");
const searchRoute = require("./routes/v1/search");
// couponCodeRoute
const couponCodeRoute = require("./routes/v1/couponCode.route");
const RazorPayRoutes = require("./routes/v1/rpPayment.route");
//connnecting mongoDB server

mongoose
	.connect(mongoDbUrl, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
	})
	.then(() => {
		console.log("DB connnection successful!");
		app.listen(PORT, (err) => {
			if (err) throw err;
			console.log(`server is running at ${PORT}`);
		});
	})
	.catch((err) => {
		throw err;
	});

//logging logs
if (process.env.NODE_ENV === "production") {
	app.use(morgan("tiny"));
	mongoose.set("debug", false);
	// Sentry.init({
	// 	dsn: 'https://205a754bb1454efebb7eca33be453c79@o324730.ingest.sentry.io/5805465',

	// 	// Set tracesSampleRate to 1.0 to capture 100%
	// 	// of transactions for performance monitoring.
	// 	// We recommend adjusting this value in production
	// 	tracesSampleRate: 1.0,
	// });

	// const transaction = Sentry.startTransaction({
	// 	op: 'test',
	// 	name: 'My First Test Transaction',
	// });
} else {
	app.use(morgan("dev"));
	mongoose.set("debug", true);
}

//initiallizaing passport
app.use(passport.initialize());
require("./utils/shopRole");
require("./utils/adminRole")(passport);
require("./utils/firebase");
require("./utils/gcm");
// // TRIM ALL BODY
app.use(postTrimmer);

function postTrimmer(req, res, next) {
	if (req.method === "POST") {
		for (const [key, value] of Object.entries(req.body)) {
			if (typeof value === "string") {
				req.body[key] = value.trim();
			}
		}
	}
	next();
}

// API serving routes
app.use("/api/v1/auth", apiLimiter, authRoute);
app.use("/api/v1/profile", apiLimiter, profileRoute);
app.use("/api/v1/admin", apiLimiter, adminRoute);
app.use("/api/v1/subadmin", apiLimiter, subAdminRoute);
app.use("/api/v1/employee", apiLimiter, employeeRoute);
app.use("/api/v1/service", apiLimiter, servicesRoute);
app.use("/api/v1/order", apiLimiter, ordersRoute);
app.use("/api/v1/dynamic", apiLimiter, dynamicRoute);
// app.use("/api/v1/search", apiLimiter, searchRoute);
app.use("/api/v1/helper", apiLimiter, helperRoute);
// couponCodeRoute route
app.use("/api/v1/coupon-code", apiLimiter, couponCodeRoute);

// RazorPayRoutes
app.use("/api/v1/rp-payment", apiLimiter, RazorPayRoutes);
// psuihnin
// FOR REACT JS APP
//if the app is in production then serve files also
if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test") {
	app.use(express.static(path.join(__dirname, "..", "admin", "build")));
	// app.use(express.static(path.join(__dirname, '..', 'admin', 'public')));
	app.get("/*", (req, res) => {
		res.sendFile(path.join(__dirname, "..", "admin", "build", "index.html"));
	});
}
