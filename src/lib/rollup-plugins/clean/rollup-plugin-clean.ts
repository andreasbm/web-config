import { green } from "colors";
import { emptyDirSync, existsSync } from "fs-extra";
import { normalize } from "path";

export interface IRollupPluginCleanConfig {
	targets: string[];
	verbose: boolean;
}

const defaultConfig: IRollupPluginCleanConfig = {
	targets: [],
	verbose: true
};

/**
 * A Rollup plugin that clean directories before rebuilding.
 * @param config
 */
export function clean (config: Partial<IRollupPluginCleanConfig> = {}) {
	const {targets, verbose} = {...defaultConfig, ...config};
	return {
		name: "clean",
		generateBundle: (): void => {
			for (const target of targets) {
				const path = normalize(target);
				if (existsSync(path)) {
					if (verbose) {
						console.log(green(`[clean] - Cleaning "${path}"`));
					}

					emptyDirSync(path);
				}
			}
		}
	};
}
