const rimraf = require("rimraf");
const path = require("path");
const fs = require("fs-extra");

const distPath = "dist";
const libPath = "src/lib";

/**
 * Builds the library.
 * @returns {Promise<void>}
 */
async function build () {

	// Clean the dist folders
	await cleanDist();

	// Copy the lib files
	await copyFiles(libPath, distPath, [
		"babel.config.js",
		"create-babel-config.js",
		"create-rollup-config.js",
		"index.js",
		"tsconfig.json",
		"tslint.json"
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
 * @returns {Promise<any>}
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

