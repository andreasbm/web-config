import boxen from "boxen";
import colors from "colors";
import fileSize from "filesize";
import fse from "fs-extra";
import gzipSize from "gzip-size";
import readdir from "recursive-readdir-sync";

const defaultConfig = {
	sizes: {},

	render: defaultRender,

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
 * @param name
 * @returns {*}
 */
function defaultRender ({gzippedSize, max, name}) {
	const sizePerc = gzippedSize / max;
	const aboveMax = sizePerc > 1;

	const titleColor = colors["green"].bold;
	const valueColor = colors["yellow"];
	const statusColor = colors[aboveMax ? "red" : "yellow"];
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
	const {sizes, timeout, render} = {...defaultConfig, ...config};

	return {
		name: "budget",
		generateBundle (outputOptions, bundle, isWrite) {

			// If no sizes has been specifies we can already abort now.
			if (Object.keys(sizes) === 0) {
				return;
			}

			setTimeout(() => {
				const target = outputOptions.dir;
				readdir(target)
					.map(path => {
						return {max: budgetForPath(path, sizes), path}
					})
					.filter(({max}) => max != null && max > 0)
					.forEach(({path, max}) => {
						const content = fse.readFileSync(path);
						const name = fileNameForPath(path);
						const gzippedSize = getGzippedSizeBytes(content);
						// const actualSize = getSizeBytes(content);
						console.log(render({max, gzippedSize, name}))
					});
			}, timeout);
		}
	};
}
