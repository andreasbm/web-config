import boxen from "boxen";
import colors from "colors";
import fileSize from "filesize";
import gzipSize from "gzip-size";

const defaultConfig = {
	max: 1024 * 170 // Max bundle size in bytes (170kb)
};

/**
 * Returns the gzipped bundle size.
 * @param code
 * @returns {Number}
 */
function getGzippedSizeBytes (code) {
	return gzipSize.sync(code);
}

/**
 * Returns the bundle size.
 * @param code
 * @returns {number}
 */
function getSizeBytes (code) {
	return Buffer.byteLength(code);
}

function clamp (value, min, max) {
	return Math.max(Math.min(value, max), min);
}

function roundNumber (num) {
	return Math.round(num * 100) / 100;
}

function initArray (length, value) {
	return Array.from({length}, () => value);
}

function render ({size, max, slack, name}) {
	const sizePerc = size / max;
	const aboveMax = sizePerc > 1;

	const titleColor = colors["green"].bold;
	const valueColor = colors["yellow"];
	const statusColor = colors[aboveMax ? "red" : "yellow"];
	const barMaxLength = 20;

	const values = [
		`${titleColor("Chunk Name:")}    ${valueColor(name)}`,
		`${titleColor("Budget Size:")}    ${valueColor(fileSize(max))}`,
		`${titleColor("Minified Size:")}  ${statusColor(fileSize(size))}`,
		`${statusColor("[")}${statusColor(initArray(Math.round(clamp(sizePerc * barMaxLength, 0, barMaxLength)), "#").join(""))}${statusColor(initArray(clamp(Math.round((1 - sizePerc) * barMaxLength), 0, barMaxLength), ".").join(""))}${statusColor("]")} ${statusColor("(" + roundNumber(sizePerc * 100) + "%)")}`
	];

	return boxen(values.join("\n"), {padding: 1});
}

export function budget (config = defaultConfig) {
	const {max} = {...defaultConfig, ...config};

	if (max === 0) {
		throw new Error("[budget] - Please provide a non zero max.");
	}

	return {
		name: "budget",
		generateBundle (outputOptions, bundle, isWrite) {
			Object.keys(bundle)
				.map(fileName => bundle[fileName])
				.filter(chunk => !chunk.isAsset)
				.forEach(chunk => {
					const size = getGzippedSizeBytes(chunk.code);
					const name = chunk.fileName;
					console.log(render({max, size, name}));
				});
		}
	};
}
