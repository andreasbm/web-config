import {readFile, writeFileSync} from 'fs';
import {createFilter} from 'rollup-pluginutils';

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

	include: [],
	exclude: []
};

/**
 * Injects the sources for the bundle entrypoints and generates a HTML file.
 * Inspired by https://github.com/bengsfort/rollup-plugin-generate-html-template/blob/master/src/index.js
 * @param bundle
 * @param template
 * @param target
 * @param include
 * @param exclude
 * @returns {Promise<void>}
 */
function generateFile ({bundle, template, target, include, exclude}) {
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
			const filter = createFilter(include, exclude);
			const fileNames = Object.entries(bundle).filter(([key, value]) => filter(value.fileName)).map(([key, value]) => value.fileName);

			// Inject the script tag before the body close tag.
			const html = [
				template.slice(0, bodyCloseTagIndex),
				...fileNames.map(filename => `<script src="${filename}" type="text/javascript"></script>\n`),
				template.slice(bodyCloseTagIndex, template.length)
			].join('');

			// Write the injected template to a file.
			try {
				writeFileSync(target, html);
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
export default function htmlTemplate (config = defaultConfig) {
	const {template, target, include, exclude} = {...defaultConfig, ...config};

	if (template == null || target == null) {
		throw new Error(`The htmlTemplate plugin needs both a template and a target`);
	}

	return {
		name: 'htmlTemplate',
		generateBundle: (outputOptions, bundle, isWrite) => {
			if (isWrite) {
				return generateFile({bundle, template, target, include, exclude});
			}
		},
	}
};