import colors from "colors";
import {generateSW, injectManifest} from "workbox-build";

/**
 * Default configuration for the workbox rollup plugin.
 * @type {{mode: string, verbose: boolean}}
 */
const defaultConfig = {
	mode: "generateSW",
	verbose: true
};

/**
 * Returns the correct method to for generating the Service Worker.
 * @param mode
 * @returns {*}
 */
function workboxFactory (mode) {
	if (mode === `injectManifest`) {
		return injectManifest;

	} else if (mode === `generateSW`) {
		return generateSW;
	}

	throw new Error(`[workbox] - The mode "${mode} is not valid"`);
}

/**
 * A plugin that uses Workbox to generate a Service Worker.
 * @param config
 * @returns {{name: string, generateBundle: generateBundle}}
 */
export function workbox (config, ) {
	const {workboxConfig, mode, verbose} = {...defaultConfig, ...config};

	// Ensure a workbox config exists
	if (workboxConfig == null) {
		throw new Error(`[workbox] - The workboxConfig needs to be defined`);
	}

	return {
		name: "workbox",
		generateBundle: async (outputOptions, bundle, isWrite) => {
			if (!isWrite) return;

			try {
				await workboxFactory(mode)(workboxConfig);

			} catch (ex) {
				if (verbose) {
					console.log(colors.red(`[workbox] - The Service Worker could not be generated: "${ex.message}"`));
				}
			}
		}
	}
}

