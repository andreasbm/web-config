import colors from "colors";
import {generateSW, injectManifest} from "workbox-build";

/**
 * Default configuration for the workbox rollup plugin.
 * @type {{mode: string, verbose: boolean}}
 */
const defaultConfig = {
	mode: "generateSW",
	verbose: true,
	timeout: 2000
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
 * A Rollup plugin that uses workbox to generate a service worker.
 * @param config
 * @returns {{name: string, generateBundle: generateBundle}}
 */
export function workbox (config,) {
	const {workboxConfig, mode, verbose, timeout} = {...defaultConfig, ...config};

	// Ensure a workbox config exists
	if (workboxConfig == null) {
		throw new Error(`[workbox] - The workboxConfig needs to be defined`);
	}

	return {
		name: "workbox",
		generateBundle: async (outputOptions, bundle, isWrite) => {
			if (!isWrite) return;

			try {
				setTimeout(async () => {
					await workboxFactory(mode)(workboxConfig);
				}, 1000);
				await workboxFactory(mode)(workboxConfig);

			} catch (ex) {
				if (verbose) {
					console.log(colors.red(`[workbox] - The Service Worker could not be generated: "${ex.message}"`));
				}
			}
		}
	}
}

