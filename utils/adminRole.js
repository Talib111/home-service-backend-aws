const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const Shop = require('../model/v1/Shops');
const keys = process.env.SECRET || '';

const opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys;

module.exports = (passport) => {
	passport.use(
		'admin-rule',
		new JwtStrategy(opts, (payload, done) => {
			console.log('admin signin');
			Admin.findById(payload._id)
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
};
