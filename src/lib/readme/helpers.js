
/**
 * Determines whether an object has the specified key.
 * @param obj
 * @param key
 * @returns {boolean}
 */
function hasKey (obj, key) {
	return getKey(obj, key) != null;
}

/**
 * Returns a key from an object.
 * @param obj
 * @param key
 * @returns {*}
 */
function getKey (obj, key) {
	let keys = key.split(".");
	while (keys.length > 0 && obj != null) {
		key = keys.shift();
		obj = obj[key];
	}

	return obj;
}

/**
 * Validates the package.
 * @param pkg
 * @param requiredFields
 * @param fileName
 * @returns {boolean}
 */
function validateObject (pkg, requiredFields, fileName) {
	for (const key of requiredFields) {
		if (!hasKey(pkg, key)) {
			throw new Error(`"${fileName}" requires the field "${key}".`);
		}
	}

	return true;
}

/**
 * Replaces the placeholders.
 * @param text
 * @param pkg
 * @returns {*}
 */
function replace (text, pkg) {
	return text.replace(/{{[ ]*(.+?)[ ]*}}/g, (string, match) => {
		return getKey(pkg, match.trim());
	})
}

module.exports = {
	hasKey,
	getKey,
	validateObject,
	replace
};
