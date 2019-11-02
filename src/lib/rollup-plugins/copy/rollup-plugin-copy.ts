import { yellow } from "colors";
import { existsSync, copy as fsCopy } from "fs-extra";
import { OutputBundle, OutputOptions } from "rollup";

export interface IRollupPluginCopyConfig {
	resources: [string, string][];
	verbose: boolean;
	overwrite: boolean;
}

/**
 * Default configuration for the copy plugin.
 * @type {{resources: Array}}
 */
const defaultConfig: IRollupPluginCopyConfig = {
	resources: [],
	verbose: true,
	overwrite: true
};

/**
 * A Rollup plugin that copies resources from one location to another.
 * @param config
 */
export function copy(config: Partial<IRollupPluginCopyConfig> = {}) {
	const { resources, verbose, overwrite } = { ...defaultConfig, ...config };

	return {
		name: "copy",
		generateBundle: async (outputOptions: OutputOptions, bundle: OutputBundle, isWrite: boolean): Promise<void> => {
			if (!isWrite) return;
			for (const [from, to] of resources) {
				try {
					if (overwrite || !existsSync(to)) {
						await fsCopy(from, to);
					}
				} catch (err) {
					if (verbose) {
						console.log(yellow(`[copy] - The file "${from}" could not be copied to "${to}"\n`), err.message);
					}
				}
			}
		}
	};
}
