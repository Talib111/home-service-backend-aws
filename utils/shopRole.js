const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const passport = require('passport');
const Seller = require('../model/v1/Seller');
const Shop = require('../model/v1/Shops');
const keys = process.env.SECRET || '';

const opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('Bearer');
opts.secretOrKey = keys;

// module.exports = (passport) => {
passport.use(
	'shop-rule',
	new JwtStrategy(opts, (payload, done) => {
		console.log('shop-rule');
		console.log(payload);
		Seller.findById(payload._id)
			.then((user) => {
				if (!user) {
					return done(null, false);
				} else {
					return done(null, user);
				}
			})
			.catch((err) => {
				throw err;
			});
	})
);
// };
