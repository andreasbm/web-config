import colors from "colors";
import { readFile } from "fs";
import fse from "fs-extra";
import { OutputBundle, OutputOptions } from "rollup";
import { createFilter } from "@rollup/pluginutils";

export type ScriptType = "module" | "text/javascript";

export type TransformScript = ({ filename, scriptType }: ITransformScriptOptions) => string;

export interface ITransformScriptOptions {
	filename: string;
	scriptType: ScriptType;
}

export interface ITransformOptions {
	template: string;
	bodyCloseTagIndex: number;
	fileNames: string[];
	scriptType: ScriptType;
	polyfillConfig: IPolyfillConfig;
	transformScript: TransformScript;
}

export interface IPolyfillConfig {
	src: string;
	crossorigin: boolean;
	force: boolean;
	context: "window" | "worker" | "node";
	features: string[];
	options: string[];
}

export interface IRollupPluginHtmlTemplateConfig {
	// HTML template (needs to contain a body tag)
	template: string;

	// The target destination for the generated file
	target: string;

	// Transforms the template
	transform: (info: ITransformOptions) => string;

	// Transform the script
	transformScript: TransformScript;

	verbose: boolean;
	include: (string | RegExp)[] | string | RegExp | null;
	exclude: (string | RegExp)[] | string | RegExp | null;
	scriptType: ScriptType;
	polyfillConfig: Partial<IPolyfillConfig>;
}

/**
 * Default configuration for the polyfill.
 */
const defaultPolyfillConfig: IPolyfillConfig = {
	src: "https://polyfill.app/api/polyfill",
	crossorigin: true,
	force: false,
	context: "window",
	features: [],
	options: []
};

/**
 * Default configuration for the html template plugin.
 * Note that both template and target are required.
 */
const defaultConfig: Partial<IRollupPluginHtmlTemplateConfig> = {
	transform: transformTemplate,
	transformScript: transformScript,
	verbose: true,
	include: [],
	exclude: [],
	scriptType: "module",
	polyfillConfig: defaultPolyfillConfig
};

/**
 * Returns the script tag for the polyfill config.
 * @param crossorigin
 * @param features
 * @param src
 * @param options
 */
export function getPolyfillScript({ crossorigin, features, src, options }: IPolyfillConfig) {
	src = `${src}?${features.length > 0 ? `features=${features.join(",")}` : ""}${options.length > 0 ? `|${options.join("|")}` : ""}`;
	return `<script ${crossorigin ? "crossorigin" : ""} src="${src}"></script>`;
}

/**
 * Transform the script tag.
 * @param filename
 * @param scriptType
 */
export function transformScript({ filename, scriptType }: ITransformScriptOptions) {
	return `<script src="${filename}" type="${scriptType}"></script>`;
}

/**
 * Transform the template and inserts a script tag for each file.
 * Injects the script tags before the body close tag.
 * @param template
 * @param bodyCloseTagIndex
 * @param fileNames
 * @param scriptType
 * @param polyfillConfig
 * @param transformScript
 */
export function transformTemplate({
	template,
	bodyCloseTagIndex,
	fileNames,
	scriptType,
	polyfillConfig,
	transformScript
}: ITransformOptions): string {
	return [
		template.slice(0, bodyCloseTagIndex),
		polyfillConfig.features.length > 0 ? `${getPolyfillScript(polyfillConfig)}\n` : "",
		...fileNames.map(filename => transformScript({ filename, scriptType })).join("\n"),
		template.slice(bodyCloseTagIndex, template.length)
	].join("");
}

/**
 * Injects the sources for the bundle entrypoints and generates a HTML file.
 * Inspired by https://github.com/bengsfort/rollup-plugin-generate-html-template/blob/master/src/index.js
 * @param bundle
 * @param template
 * @param target
 * @param filter
 * @param scriptType
 * @param verbose
 * @param include
 * @param exclude
 * @param transform
 * @param polyfillConfig
 * @param transformScript
 */
async function generateFile({
	bundle,
	template,
	target,
	filter,
	scriptType,
	verbose,
	include,
	exclude,
	transform,
	polyfillConfig,
	transformScript
}: IRollupPluginHtmlTemplateConfig & { bundle: OutputBundle; filter: (path: string) => boolean }) {
	return new Promise((res, rej) => {
		readFile(template, (err, buffer) => {
			// If the file could not be read, abort!
			if (err) {
				return rej(err);
			}

			// Convert the buffer into a string
			const template = buffer.toString("utf8");

			// Grab the index of the body close tag
			const bodyCloseTagIndex = template.lastIndexOf("</body>");

			// Grab fileNames of the entry points
			const unfilteredFilenames = Object.values(bundle).map(value => value.fileName);
			const fileNames = unfilteredFilenames.filter(name => filter(name));

			// Error handling
			if (verbose && fileNames.length === 0) {
				console.log(
					colors.yellow(
						`[htmlTemplate] - No scripts were injected into the "${target}" template file. Make sure to specify the files that should be injected using the include option. Currently the include option has been set to "${include}" and the exclude option to "${exclude}". The filenames passed to the plugin are "${unfilteredFilenames.join(
							", "
						)}"\n`
					)
				);
			}

			// Transform the template
			const html = transform({
				template,
				bodyCloseTagIndex,
				fileNames,
				scriptType,
				transformScript,
				polyfillConfig: polyfillConfig as IPolyfillConfig
			});

			// Write the injected template to a file.
			try {
				fse.outputFileSync(target, html);
				res();
			} catch (err) {
				rej(err);
			}
		});
	});
}

/**
 * A Rollup plugin that injects the bundle entry points into a HTML file.
 * @param config
 */
export function htmlTemplate(config: Partial<IRollupPluginHtmlTemplateConfig> = {}) {
	config = { ...defaultConfig, ...config };
	const { template, target, include, exclude, polyfillConfig } = { ...defaultConfig, ...config };
	const filter = createFilter(include, exclude);

	// Throw error if neither the template nor the target has been defined
	if (template == null || target == null) {
		throw new Error(`The htmlTemplate plugin needs both a template and a target.`);
	}

	return {
		name: "htmlTemplate",
		generateBundle: async (outputOptions: OutputOptions, bundle: OutputBundle, isWrite: boolean): Promise<void> => {
			if (!isWrite) return;

			// @ts-ignore
			return generateFile({
				...config,
				polyfillConfig: { ...defaultPolyfillConfig, ...polyfillConfig },
				bundle,
				filter
			});
		}
	};
}
