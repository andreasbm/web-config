import {CONFIG} from "./config";
import fse from "fs-extra";
import path from "path";

/**
 * Determines whether an object has the specified key.
 * @param obj
 * @param key
 * @returns {boolean}
 */
export function hasKey (obj, key) {
	return getKey(obj, key) != null;
}

/**
 * Returns a key from an object.
 * @param obj
 * @param key
 * @returns {*}
 */
export function getKey (obj, key) {
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
export function validateObject (pkg, requiredFields, fileName) {
	for (const key of requiredFields) {
		if (!hasKey(pkg, key)) {
			throw new Error(`"${fileName}" requires the field "${key}".`);
		}
	}

	return true;
}

/**
 * Replaces the placeholders with content from the package.
 * @param text
 * @param pkg
 * @returns {*}
 */
export function replace (text, pkg) {
	return text.replace(/{{[ ]*(.+?)[ ]*}}/g, (string, match) => {
		return getKey(pkg, match.trim());
	})
}

/**
 * Returns available badges.
 * @param pkg
 * @returns {Array}
 */
export function getBadges (pkg) {
	const badges = pkg.readme.badges || [];

	// Add NPM badges
	if (hasKey(pkg, "readme.ids.npm")) {
		badges.push(...CONFIG.NPM_BADGES);
	}

	// Add Github badges
	if (hasKey(pkg, "readme.ids.github")) {
		badges.push(...CONFIG.GITHUB_BADGES);
	}

	// Add webcomponents badges
	if (hasKey(pkg, "readme.ids.webcomponents")) {
		badges.push(...CONFIG.WEBCOMPONENTS_BADGES);
	}

	return badges
}

/**
 * Generates a readme.
 * @param pkgName
 * @param generators
 */
export function generateReadme (pkgName, generators) {

	// Read the content from the package.json file
	const pkgContent = fse.readFileSync(path.resolve(pkgName)).toString("utf8");

	// Parse the package and validate it
	const pkg = JSON.parse(pkgContent);
	validateObject(pkg, CONFIG.REQUIRED_PKG_FIELDS, pkgName);

	// Generate the readme string
	return generators.map(generator => generator(pkg))
		.filter(res => res != null)
		.join(`${CONFIG.LINE_BREAK}${CONFIG.LINE_BREAK}`);
}


/**
 * Writes a file to a path.
 * @param path
 * @param content
 */
export function writeFile (path, content) {
	const stream = fse.createWriteStream(path);
	stream.write(content);
	stream.end();
}
