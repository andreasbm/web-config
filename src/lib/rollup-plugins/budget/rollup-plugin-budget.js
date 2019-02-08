import boxen from "boxen";
import colors from "colors";
import fileSize from "filesize";
import fse from "fs-extra";
import gzipSize from "gzip-size";
import readdir from "recursive-readdir-sync";

const defaultConfig = {
	sizes: {},
	render: defaultRender,

	// The name of the output file where the budget for the files is printed to.
	fileName: "budget.txt",

	// Whether or not the budget for the files should be printed to the console.
	silent: true,

	// The threshold of what files should be ignored. Every percentage below the threshold is ignored
	threshold: 0,

	// We need a timeout to make sure all files have been bundled
	timeout: 2000
};

/**
 * Returns the gzipped bundle size.
 * @param content
 * @returns {Number}
 */
function getGzippedSizeBytes (content) {
	return gzipSize.sync(content);
}

/**
 * Returns the bundle size.
 * @param content
 * @returns {number}
 */
function getSizeBytes (content) {
	return Buffer.byteLength(content);
}

/**
 * Clamps a value between a max and a min (inclusive).
 * @param value
 * @param min
 * @param max
 * @returns {number}
 */
function clamp (value, min, max) {
	return Math.max(Math.min(value, max), min);
}

/**
 * Rounds a number to two digits.
 * @param num
 * @returns {number}
 */
function roundNumber (num) {
	return Math.round(num * 100) / 100;
}

/**
 * Initializes an array with a length and a start value.
 * @param length
 * @param value
 * @returns {any[]}
 */
function initArray (length, value) {
	return Array.from({length}, () => value);
}

/**
 * Returns the file name for a path.
 * @param path
 * @returns {*}
 */
function fileNameForPath (path) {
	return path.replace(/^.*[\\\/]/, '');
}

/**
 * Returns a formatted string containing the status of the file budget.
 * @param gzippedSize
 * @param max
 * @param sizePerc
 * @param aboveMax
 * @param name
 * @param format
 * @returns {*}
 */
function defaultRender ({gzippedSize, max, sizePerc, aboveMax, name, format}) {

	const titleColor = format ? colors["green"].bold : text => text;
	const valueColor = format ? colors["yellow"] : text => text;
	const statusColor = format ? colors[aboveMax ? "red" : "yellow"] : text => text;
	const barMaxLength = 20;

	const values = [
		`${titleColor("File Name:")}     ${valueColor(name)}`,
		`${titleColor("Budget Size:")}   ${valueColor(fileSize(max))}`,
		// `${titleColor("Actual Size:")}   ${statusColor(fileSize(actualSize))}`,
		`${titleColor("Gzipped Size:")}  ${statusColor(fileSize(gzippedSize))}`,
		`${statusColor("[")}${statusColor(initArray(Math.round(clamp(sizePerc * barMaxLength, 0, barMaxLength)), "#").join(""))}${statusColor(initArray(clamp(Math.round((1 - sizePerc) * barMaxLength), 0, barMaxLength), ".").join(""))}${statusColor("]")} ${statusColor("(" + roundNumber(sizePerc * 100) + "%)")}`
	];

	return boxen(values.join("\n"), {padding: 1});
}

/**
 * Returns the budget for a specific path.
 * If no budget has been specified null is returned.
 * @param path
 * @param sizes
 * @returns {*}
 */
function budgetForPath (path, sizes) {
	for (const [name, max] of Object.entries(sizes)) {
		const isExtension = name.startsWith(".");
		if (path.match(name + (isExtension ? "$" : ""))) {
			return max;
		}
	}

	return null;
}

/**
 * A Rollup plugin that compares the sizes of the files to a specified budget.
 * @param config
 * @returns {{name: string, generateBundle(*, *, *): (undefined|void)}}
 */
export function budget (config = defaultConfig) {
	const {sizes, timeout, render, silent, fileName, threshold} = {...defaultConfig, ...config};
	const isOutputJson = fileName.endsWith(".json");

	return {
		name: "budget",
		generateBundle (outputOptions, bundle, isWrite) {

			// If no sizes has been specifies we can already abort now.
			if (Object.keys(sizes).length === 0) {
				return;
			}

			setTimeout(() => {
				const target = outputOptions.dir;
				const stream = fse.createWriteStream(`${outputOptions.dir}/${fileName}`);

				const results = readdir(target)
					.map(path => {
						return {max: budgetForPath(path, sizes), path}
					})
					.filter(({max}) => max != null && max > 0)
					.map(({path, max}) => {
						const content = fse.readFileSync(path);
						const name = fileNameForPath(path);
						const gzippedSize = getGzippedSizeBytes(content);
						const sizePerc = gzippedSize / max;
						const aboveMax = sizePerc > 1;
						return {name, gzippedSize, sizePerc, aboveMax, max, path};
					})
					// Ensure the ones closest to the budget are in top
					.sort((a, b) => b.sizePerc - a.sizePerc);

				for (const result of results) {

					// Skip the reporting if the size perc is below the threshold
					if (result.sizePerc < threshold) {
						return;
					}

					// Print to the console if not silent
					if (!silent) {
						console.log(render({...result, format: true}));
					}

					// Write to the file
					if (!isOutputJson) {
						stream.write(render(result) + "\n\n");
					}
				}

				// Write the output as json instead
				if (isOutputJson) {
					stream.write(JSON.stringify(results, null, 2));
				}

				stream.end();

			}, timeout);
		}
	};
}
