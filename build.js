const rimraf = require("rimraf");
const path = require("path");
const fs = require("fs-extra");

const distPath = "dist";

/**
 * Builds the library.
 * @returns {Promise<void>}
 */
async function build () {

	// Clean the dist folders
	await cleanDist();

	// Copy the lib files
	await copyFiles("src/lib", distPath, [
		"babel.config.js",
		"create-babel-config.js",
		"create-rollup-config.js",
		"index.js",
		"tsconfig.json",
		"tslint.json"
	]);

	// Copy rollup plugins
	await copyFiles("src/lib/rollup-plugins", `${distPath}/rollup-plugins`, [
		"rollup-plugin-html-template.js",
		"rollup-plugin-import-scss.js",
		"rollup-plugin-minify-lit-html.js"
	]);

	// Copy the root files
	await copyFiles("", distPath, [
		".gitignore",
		".browserslistrc",
		"README.md",
		"package.json"
	]);
}

/**
 * Cleans the dist folder.
 * @returns {Promise<void>}
 */
function cleanDist () {
	return new Promise((res, rej) => {
		rimraf(distPath, res);
	});
}

/**
 * Copies an array of files.
 * @param inSrc
 * @param outSrc
 * @param files
 * @returns {Promise<void>}
 */
function copyFiles (inSrc, outSrc, files) {
	return new Promise((res, rej) => {
		for (const file of files) {
			copySync(`./${inSrc}/${file}`, `./${outSrc}/${file}`);
		}
		res();
	});
}

/**
 * Copies a file.
 * @param src
 * @param dest
 */
function copySync (src, dest) {
	fs.copySync(path.resolve(__dirname, src), path.resolve(__dirname, dest));
}

build().then(_ => {
	console.log("Done!");
});

