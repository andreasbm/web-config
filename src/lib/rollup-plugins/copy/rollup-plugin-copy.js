import colors from "colors";
import fse from "fs-extra";

/**
 * Default configuration for the copy plugin.
 * @type {{resources: Array}}
 */
const defaultConfig = {
	resources: [],
	verbose: true,
	overwrite: true
};

/**
 * A Rollup plugin that copies resources from one location to another.
 * @param config
 * @param config
 * @returns {{name: string, generateBundle: generateBundle}}
 */
export function copy (config) {
	const {resources, verbose, overwrite} = {...defaultConfig, ...config};

	return {
		name: "copy",
		generateBundle: async (outputOptions, bundle, isWrite) => {
			if (!isWrite) return;
			for (const [from, to] of resources) {
				try {
					if (overwrite || !fse.existsSync(to)) {
						await fse.copy(from, to);
					}
				} catch (ex) {
					if (verbose) {
						console.log(colors.yellow(`[copy] - The file "${from}" could not be copied to "${to}"\n`, ex.message));
					}
				}
			}

		}
	};
}


