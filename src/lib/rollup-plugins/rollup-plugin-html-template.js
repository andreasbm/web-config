import {readFile} from 'fs';
import fse from "fs-extra";
import {createFilter} from 'rollup-pluginutils';
import colors from "colors";

/**
 * Default configuration for the html template plugin.
 * Note that both template and target are required.
 * @type {{template: null, target: null}}
 */
const defaultConfig = {

	// HTML template (needs to contain a body tag)
	template: null,

	// The target destination for the generated file
	target: null,

	// Transforms the template
	transform: transformTemplate,

	verbose: true,
	include: [],
	exclude: [],
	scriptType: "module"
};

/**
 * Transform the template and inserts a script tag for each file.
 * Injects the script tags before the body close tag.
 * @param template
 * @param bodyCloseTagIndex
 * @param fileNames
 * @param scriptType
 * @returns {string}
 */
function transformTemplate ({template, bodyCloseTagIndex, fileNames, scriptType}) {
	return [
		template.slice(0, bodyCloseTagIndex),
		...fileNames.map(filename => `<script src="${filename}" type="${scriptType}"></script>\n`),
		template.slice(bodyCloseTagIndex, template.length)
	].join('');
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
 * @returns {Promise<any>}
 */
function generateFile ({bundle, template, target, filter, scriptType, verbose, include, exclude, transform}) {
	return new Promise((res, rej) => {
		readFile(template, (err, buffer) => {

			// If the file could not be read, abort!
			if (err) {
				return rej(err);
			}

			// Convert the buffer into a string
			const template = buffer.toString("utf8");

			// Grab the index of the body close tag
			const bodyCloseTagIndex = template.lastIndexOf('</body>');

			// Grab fileNames of the entry points
			const unfilteredFilenames = Object.entries(bundle).map(([key, value]) => value.fileName);
			const fileNames = unfilteredFilenames.filter(name => filter(name));

			// Error handling
			if (verbose && fileNames.length === 0) {
				console.log(colors.yellow(`[htmlTemplate] - No scripts were injected into the "${target}" template file. Make sure to specify the files that should be injected using the include option. Currently the include option has been set to "${include}" and the exclude option to "${exclude}". The filenames passed to the plugin are "${unfilteredFilenames.join(", ")}"\n`));
			}

			// Transform the template
			const html = transform({template, bodyCloseTagIndex, fileNames, scriptType});

			// Write the injected template to a file.
			try {
				fse.outputFileSync(target, html);
				res();

			} catch (err) {
				rej(err);
			}
		})
	});
}

/**
 * A Rollup plugin that injects the bundle entry points into a HTML file.
 * @param config
 * @returns {{name: string, generateBundle: (function(*, *, *): Promise<any>)}}
 */
export function htmlTemplate (config = defaultConfig) {
	const {template, target, include, exclude, scriptType, verbose, transform} = {...defaultConfig, ...config};
	const filter = createFilter(include, exclude);

	// Throw error if neither the template nor the target has been defined
	if (template == null || target == null) {
		throw new Error(`The htmlTemplate plugin needs both a template and a target`);
	}

	return {
		name: "htmlTemplate",
		generateBundle: (outputOptions, bundle, isWrite) => {
			if (!isWrite) return;
			return generateFile({bundle, template, target, filter, scriptType, verbose, include, exclude, transform});
		},
	}
}