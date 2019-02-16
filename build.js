const rimraf = require("rimraf");
const path = require("path");
const fs = require("fs-extra");
const rollup = require('rollup');
const pkg = require("./package.json");

const distPath = "dist";

const inputOptions = (input) => {
	return {
		input,
		external: [
			...Object.keys(pkg.dependencies || {}),
			...Object.keys(pkg.devDependencies || {}),
		]
	}
};

const outputOptionsEsm = (file) => {
	return {
		format: "esm",
		file
	}
};

const outputOptionsCjs = (file) => {
	return {
		format: "cjs",
		file
	}
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
		"tsconfig.json",
		"tslint.json",
		"typings.d.ts"
	]);

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

	// Create the lib bundle
	const libBundle = await rollup.rollup({
		...inputOptions("./src/lib/index.js"),
		treeshake: false
	});

	await libBundle.write(outputOptionsEsm("dist/index.esm.js"));
	await libBundle.write(outputOptionsCjs("dist/index.cjs.js"));
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

