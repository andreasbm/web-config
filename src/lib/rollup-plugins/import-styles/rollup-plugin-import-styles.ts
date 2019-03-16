import MagicString from "magic-string";
import postcss from "postcss";
import { ResolveIdResult, TransformSourceDescription } from "rollup";
import {emptySourcemap} from "../util";
import sass from "node-sass";
import {resolve, dirname} from "path";

export type Transformer = ((css: string) => string);
export type GetTransformer = ((id: string, isGlobal: boolean) => Transformer);

export interface IRollupPluginImportStylesConfig {
	// Postcss plugins.
	plugins: any[];

	// File types handled by this plugin.
	extensions: string[];

	// Global files that are injected into the DOM.
	globals: string[];

	// Configuration objects for sass and postcss
	postcssConfig: any;
	sassConfig: any;

	// Transform function for the styles
	transform: GetTransformer;
}

/**
 * Default configuration for the import SCSS plugin.
 * @type {{plugins: Array, extensions: string[], globals: Array}}
 */
const defaultConfig: IRollupPluginImportStylesConfig = {
	plugins: [],
	extensions: [".css", ".scss"],
	globals: [],
	postcssConfig: {},
	sassConfig: {},
	transform: transformImport
};


/**
 * Default transform.
 * @param id
 * @param isGlobal
 */
function transformImport (id: string, isGlobal: boolean) {
	return isGlobal ? transformGlobal : transformDefault;
}

/**
 * Overwrites the css file with "export default".
 * @param css
 * @returns {string}
 */
function transformDefault (css: string): string {
	return `export default \`${css}\``;
}

/**
 * Overwrites the css file with a global inject into the head.
 * @param css
 * @returns {string}
 */
function transformGlobal (css: string): string {
	return `
		const css = \`${css}\`;
		const $styles = document.createElement("style");
		$styles.innerText = css;
		document.head.appendChild($styles);
		export default css;
	`;
}

/**
 * Processes a SCSS file by running it through a processor and generating the code and its corresponding sourcemap.
 * @param data
 * @param id
 * @param processor
 * @param overwrite
 * @param postcssConfig
 * @param sassConfig
 */
async function processFile ({data, id, processor, overwrite, postcssConfig, sassConfig}: IRollupPluginImportStylesConfig & {overwrite: Transformer; data: string; id: string; processor: postcss.Processor}) {
	return new Promise((res) => {

		// Compile the data using the sass compiler
		const css = sass.renderSync({
			file: resolve(id),
			sourceMap: false, /* We generate sourcemaps later */
			...(sassConfig || {})
		}).css.toString();

		// The magic strings cannot handle empty strings, therefore we test whether we should already abort now.
		if (css.trim() === "") {
			return res({
				code: overwrite(""),
				map: emptySourcemap
			});
		}

		// Create a magic string container to generate source map
		const stringContainer = new MagicString(css);

		// Construct the options
		const processOptions = {
			from: id,
			to: id,
			map: {
				inline: false,
				annotation: false
			},
			...(postcssConfig || {})
		};

		// Process the file content
		processor.process(stringContainer.toString(), processOptions).then(result => {
			const css = result.css;
			stringContainer.overwrite(0, stringContainer.length(), overwrite(css));
			res({
				code: stringContainer.toString(),
				map: stringContainer.generateMap()
			})
		});
	});
}

/**
 * A Rollup plugin that makes it possible to import style files using postcss.
 * Looks for the "import css from 'styles.scss'" and "import 'styles.scss'" syntax as default.
 * @param config
 */
export function importStyles (config: Partial<IRollupPluginImportStylesConfig> = {}) {
	config = {...defaultConfig, ...config};
	const {plugins, extensions, globals, transform} = config as IRollupPluginImportStylesConfig;

	// Determines whether the file should be handled by the plugin or not.
	const filter = (id: string) => extensions.find(ext => id.endsWith(ext)) != null;

	// Determines whether the file is global or not
	const isGlobal = (id: string) => globals.find(name => id.endsWith(name)) != null;

	// Create the postcss processor based on the plugins.
	const processor = postcss(plugins);

	return {
		name: "importStyles",
		resolveId: (id: string, importer: string): ResolveIdResult => {
			if (!importer || !filter(id)) return;
			return resolve(dirname(importer), id);
		},
		transform: async (data: string, id: string): Promise<TransformSourceDescription | string | void> => {
			if (!filter(id)) return;
			const overwrite = transform(id, isGlobal(id));
			// @ts-ignore
			return processFile({...config, processor, overwrite, id, data});
		}
	}
}