const rimraf = require("rimraf");
const path = require("path");
const fs = require("fs-extra");
const rollup = require('rollup');
const pkg = require("./package.json");

const distPath = "dist";

const inputOptions = {
	input: "./src/lib/index.js",
	external: [
		...Object.keys(pkg.dependencies || {}),
		...Object.keys(pkg.devDependencies || {}),
	]
};

const outputOptionsEsm = {
	format: "esm",
	file: "dist/index.esm.js"
};

const outputOptionsCjs = {
	format: "cjs",
	file: "dist/index.cjs.js"
};

/**
 * Builds the library.
 * @returns {Promise<void>}
 */
async function build () {

	// Clean the dist folders
	await cleanDist();

	await transpileJs();

	// Copy the lib files
	await copyFiles("src/lib", distPath, [
		/*"babel.config.js",
		"create-babel-config.js",
		"create-rollup-config.js",
		"index.js",*/
		"tsconfig.json",
		"tslint.json"
	]);

	// Copy rollup plugins
	/*await copyFiles("src/lib/rollup-plugins", `${distPath}/rollup-plugins`, [
		"rollup-plugin-html-template.js",
		"rollup-plugin-import-scss.js",
		"rollup-plugin-minify-lit-html.js",
		"util.js"
	]);*/

	// Copy the root files
	await copyFiles("", distPath, [
		".gitignore",
		".npmignore",
		".browserslistrc",
		"README.md",
		"package.json"
	]);
}

async function transpileJs () {

	// create a bundle
	const bundle = await rollup.rollup(inputOptions);

	await bundle.write(outputOptionsEsm);
	await bundle.write(outputOptionsCjs);
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

