import colors from "colors";
import { OutputBundle, OutputOptions } from "rollup";
import { analyzeComponents } from "web-component-analyzer";

export interface IRollupPluginCustomElementsJsonConfig {
	verbose: boolean;
}

/**
 * Default configuration for the custom elements json rollup plugin.
 */
const defaultConfig: IRollupPluginCustomElementsJsonConfig = {
	verbose: false
};

/**
 * A Rollup plugin that uses web component analyzer to generate a custom-elements.json file.
 * @param config
 */
export function customElementsJson(config: Partial<IRollupPluginCustomElementsJsonConfig> = {}) {
	const { verbose } = { ...defaultConfig, ...config };

	return {
		name: "customElementsJson",
		generateBundle: async (outputOptions: OutputOptions, bundle: OutputBundle, isWrite: boolean): Promise<void> => {
			if (!isWrite) return;

			try {
				//analyzeComponents(sourceFile, { checker }); what? :-)
			} catch (ex) {
				if (verbose) {
					console.log(colors.red(`[customElementsJson] - Something went wrong: "${ex.message}"`));
				}
			}
		}
	};
}
