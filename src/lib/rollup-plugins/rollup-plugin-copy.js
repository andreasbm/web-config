import fse from "fs-extra";
import colors from "colors";

/**
 * Default configuration for the copy plugin.
 * @type {{resources: Array}}
 */
const defaultConfig = {
	resources: []
};

/**
 * Plugin that copies resources.
 * @param config
 * @returns {{name: string, ongenerate(): Promise<void>}}
 */
export default function copy (config) {
	const {resources} = {...defaultConfig, ...config};

	return {
		name: "copy",
		async ongenerate () {
			for (const [from, to] of resources) {
				try {
					if (!fse.existsSync(to)) {
						await fse.copy(from, to);
					}
				} catch (ex) {
					console.log(colors.yellow(`[copy] - The file "${from}" could not be copied to "${to}"\n`, ex));
				}
			}

		}
	};
}

