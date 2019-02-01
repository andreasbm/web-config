import MagicString from "magic-string";
import path from "path";
import postcss from "postcss";
import {emptySourcemap} from "../util.js";
import sass from "node-sass";
import {resolve} from "path";

/**
 * Default configuration for the import SCSS plugin.
 * @type {{plugins: Array, extensions: string[], globals: Array}}
 */
const defaultConfig = {

	// Postcss plugins.
	plugins: [],

	// File types handled by this plugin.
	extensions: [".css", ".scss"],

	// Global files that are injected into the DOM.
	globals: [],

	// Configuration objects for sass and postcss
	postcssConfig: {},
	sassConfig: {},

	// Transform function for the styles
	transform: transformImport
};

/**
 * Default transform.
 * @param id
 * @param isGlobal
 * @returns {function(css: string): string}
 */
function transformImport (id, isGlobal) {
	return isGlobal ? transformGlobal : transformDefault;
}

/**
 * Overwrites the css file with "export default".
 * @param css
 * @returns {string}
 */
function transformDefault (css) {
	return `export default \`${css}\``;
}

/**
 * Overwrites the css file with a global inject into the head.
 * @param css
 * @returns {string}
 */
function transformGlobal (css) {
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
 * @returns {Promise<any>}
 */
function processFile ({data, id, processor, overwrite, postcssConfig, sassConfig}) {
	return new Promise((res) => {

		// Compile the data using the sass compiler
		const css = sass.renderSync({
			file: resolve(process.cwd(), id),
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
 * A rollup plugin that makes it possible to import style files using postcss.
 * Looks for the "import css from 'styles.scss'" and "import 'styles.scss'" syntax as default.
 * @param config
 * @returns {{name: string, resolveId: resolveId, transform: transform}}
 */
export function importStyles (config = defaultConfig) {
	const {plugins, extensions, globals, postcssConfig, sassConfig, transform} = {...defaultConfig, ...config};

	// Determines whether the file should be handled by the plugin or not.
	const filter = (id) => extensions.find(ext => id.endsWith(ext)) != null;

	// Determines whether the file is global or not
	const isGlobal = (id) => globals.find(name => id.endsWith(name)) != null;

	// Create the postcss processor based on the plugins.
	const processor = postcss(plugins);

	return {
		name: "importStyles",
		resolveId: (id, importer) => {
			if (!importer || !filter(id)) return;
			return path.resolve(path.dirname(importer), id);
		},
		transform: (data, id) => {
			if (!filter(id)) return;
			return processFile({data, id, processor, postcssConfig, sassConfig, overwrite: transform(id, isGlobal(id))});
		}
	}
}