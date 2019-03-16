import colors from "colors";
import {resolve, parse} from "path";
import { ResolveIdResult } from "rollup";

export interface IRollupPluginReplaceConfig {
	verbose: boolean;
	resources: [string, string][];
}

const defaultConfig: IRollupPluginReplaceConfig = {
	verbose: true,
	resources: []
};

/**
 * A Rollup plugin that replaces an import with another import.
 * @param config
 */
export function replace (config: Partial<IRollupPluginReplaceConfig> = {}) {
	const {resources, verbose} = {...defaultConfig, ...config};

	return {
		name: "replace",
		resolveId: (id: string, importer: string): ResolveIdResult => {
			if (!importer) return;

			const {name: idName} = parse(id);
			for (const [from, to] of resources) {
				if (from == null || to == null) return;
				const {name: fromName} = parse(from);

				// If the id and the from name are the same, we simply need to resolve
				// it to the "to name" instead and we have replaced the file.
				if (idName === fromName) {
					if (verbose) {
						console.log(colors.green(`[replace] - Replaced "${id}" with "${to}"\n`));
					}

					return resolve(to);
				}
			}
		}
	};
}

