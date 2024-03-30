// import { customAlphabet } from "nanoid/async";
const { customAlphabet } = require("nanoid/async");

const isEmpty = (obj) => {
	for (var prop in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, prop)) {
			return false;
		}
	}

	return JSON.stringify(obj) === JSON.stringify({});
};

const customNanoId = customAlphabet("1234567890", 3);

function isEmptyObject(value) {
	if (value == null) {
		// null or undefined
		return false;
	}

	if (typeof value !== "object") {
		// boolean, number, string, function, etc.
		return false;
	}

	const proto = Object.getPrototypeOf(value);

	// consider `Object.create(null)`, commonly used as a safe map
	// before `Map` support, an empty object as well as `{}`
	if (proto !== null && proto !== Object.prototype) {
		return false;
	}

	return isEmpty(value);
}

module.exports = {
	isEmpty,
	isEmptyObject,
	customNanoId,
};
