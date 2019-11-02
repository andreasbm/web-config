import boxen from "boxen";
import colors from "colors";
import fileSize from "filesize";
import { readFileSync, createWriteStream } from "fs-extra";
import gzipSize from "gzip-size";
import readdir from "recursive-readdir-sync";
import { OutputBundle, OutputOptions } from "rollup";

export interface IBudgetResult {
	gzippedSize: number;
	max: number;
	sizePerc: number;
	aboveMax: boolean;
	name: string;
	formatted?: boolean;
	path: string;
}

export type BudgetRender = (result: IBudgetResult) => string;

export interface IRollupPluginBudgetConfig {
	sizes: { [key: string]: number };
	render: BudgetRender;

	// The name of the output file where the budget for the files is printed to.
	fileName: string;

	// Whether or not the budget for the files should be printed to the console.
	silent: boolean;

	// The threshold of what files should be ignored. Every percentage below the threshold is ignored
	threshold: number;

	// We need a timeout to make sure all files have been bundled
	timeout: number;
}

const defaultConfig: IRollupPluginBudgetConfig = {
	sizes: {},
	render: defaultRender,
	fileName: "budget.txt",
	silent: true,
	threshold: 0,
	timeout: 2000
};

/**
 * Returns the gzipped bundle size.
 * @param content
 * @returns {Number}
 */
function getGzippedSizeBytes(content: string | Buffer): number {
	return gzipSize.sync(content);
}

/**
 * Returns the bundle size.
 * @param content
 * @returns {number}
 */
function getSizeBytes(content: string): number {
	return Buffer.byteLength(content);
}

/**
 * Clamps a value between a max and a min (inclusive).
 * @param value
 * @param min
 * @param max
 * @returns {number}
 */
function clamp(value: number, min: number, max: number): number {
	return Math.max(Math.min(value, max), min);
}

/**
 * Rounds a number to two digits.
 * @param num
 * @returns {number}
 */
function roundNumber(num: number): number {
	return Math.round(num * 100) / 100;
}

/**
 * Initializes an array with a length and a start value.
 * @param length
 * @param value
 */
function initArray<T>(length: number, value: T): T[] {
	return Array(length).fill(value);
}

/**
 * Returns the file name for a path.
 * @param path
 */
function fileNameForPath(path: string): string {
	return path.replace(/^.*[\\\/]/, "");
}

/**
 * Returns a formatted string containing the status of the file budget.
 * @param gzippedSize
 * @param max
 * @param sizePerc
 * @param aboveMax
 * @param name
 * @param format
 */
function defaultRender({ gzippedSize, max, sizePerc, aboveMax, name, formatted }: IBudgetResult): string {
	// Create methods for formatting the colors
	const titleColor: (text: string) => string = formatted ? colors["green"].bold : text => text;
	const valueColor: (text: string) => string = formatted ? colors["yellow"] : text => text;
	const statusColor: (text: string) => string = formatted ? colors[aboveMax ? "red" : "yellow"] : text => text;
	const barMaxLength = 20;

	const values = [
		`${titleColor("File Name:")}     ${valueColor(name)}`,
		`${titleColor("Budget Size:")}   ${valueColor(fileSize(max))}`,
		// `${titleColor("Actual Size:")}   ${statusColor(fileSize(actualSize))}`,
		`${titleColor("Gzipped Size:")}  ${statusColor(fileSize(gzippedSize))}`,
		`${statusColor("[")}${statusColor(initArray(Math.round(clamp(sizePerc * barMaxLength, 0, barMaxLength)), "#").join(""))}${statusColor(
			initArray(clamp(Math.round((1 - sizePerc) * barMaxLength), 0, barMaxLength), ".").join("")
		)}${statusColor("]")} ${statusColor("(" + roundNumber(sizePerc * 100) + "%)")}`
	];

	return boxen(values.join("\n"), { padding: 1 });
}

/**
 * Returns the budget for a specific path.
 * If no budget has been specified null is returned.
 * @param path
 * @param sizes
 * @returns {*}
 */
function budgetForPath(path: string, sizes: { [key: string]: number }): number | null {
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
export function budget(config: Partial<IRollupPluginBudgetConfig> = {}) {
	const { sizes, timeout, render, silent, fileName, threshold } = { ...defaultConfig, ...config };
	const isOutputJson = fileName.endsWith(".json");

	return {
		name: "budget",
		generateBundle: async (outputOptions: OutputOptions, bundle: OutputBundle, isWrite: boolean): Promise<void> => {
			// If no sizes has been specifies we can already abort now.
			if (Object.keys(sizes).length === 0) {
				return;
			}

			// Wait a small amount of time for the bundle to finish before analyzing the bundle.
			setTimeout(() => {
				const target = outputOptions.dir;
				const stream = createWriteStream(`${outputOptions.dir}/${fileName}`);

				const results = readdir(target)
					.map((path: string) => {
						return { max: budgetForPath(path, sizes), path };
					})
					.filter(({ max }: { max: number }) => max != null && max > 0)
					.map(
						({ path, max }: { path: string; max: number }): IBudgetResult => {
							const content = readFileSync(path);
							const name = fileNameForPath(path);
							const gzippedSize = getGzippedSizeBytes(content);
							const sizePerc = gzippedSize / max;
							const aboveMax = sizePerc > 1;
							return { name, gzippedSize, sizePerc, aboveMax, max, path };
						}
					)
					// Ensure the ones closest to the budget are in top
					.sort((a: IBudgetResult, b: IBudgetResult) => b.sizePerc - a.sizePerc);

				// Go through all results and report them
				for (const result of results) {
					// Skip the reporting if the size perc is below the threshold
					if (result.sizePerc < threshold) {
						return;
					}

					// Print to the console if not silent
					if (!silent) {
						console.log(render({ ...result, formatted: true }));
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
