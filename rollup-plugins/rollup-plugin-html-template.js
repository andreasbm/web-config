import {readFile, writeFileSync} from 'fs';

/**
 * Default configuration for the html template plugin.
 * Note that both template and target are required.
 * @type {{template: null, target: null}}
 */
const defaultConfig = {
	template: null,
	target: null
};

/**
 * Injects the sources for the bundle entrypoints and generates a HTML file.
 * @param bundle
 * @param template
 * @param target
 * @returns {Promise<any>}
 */
function generateFile ({bundle, template, target}) {
	return new Promise((res, rej) => {
		readFile(template, (err, buffer) => {

			// If the file could not be read, abort!
			if (err) {
				return rej(err);
			}

			// Convert the buffer into a string
			const tmpl = buffer.toString('utf8');

			// Grab the index of the body close tag
			const bodyCloseTag = tmpl.lastIndexOf('</body>');

			// Grab fileNames of the entry points
			const fileNames = Object.entries(bundle).filter(([key, value]) => value.isEntry).map(([key, value]) => value.fileName);

			// Inject the script tag before the body close tag.
			const injected = [
				tmpl.slice(0, bodyCloseTag),
				fileNames.map(filename => `<script src="${filename}" type="text/javascript"></script>\n`),
				tmpl.slice(bodyCloseTag, tmpl.length),
			].join('');

			// Write the injected template to a file.
			writeFileSync(target, injected);
			res();
		})
	});
}

/**
 * A Rollup plugin that injects the bundle entry points into a HTML file.
 * @param config
 * @returns {{name: string, generateBundle: (function(*, *, *): Promise<any>)}}
 */
export default function htmlTemplate (config) {
	const {template, target} = {...defaultConfig, ...config};

	if (template == null || target == null) {
		throw new Error(`The htmlTemplate plugin needs both a template and a target`);
	}

	return {
		name: 'htmlTemplate',
		generateBundle: (outputOptions, bundle, isWrite) => {
			if (isWrite) {
				return generateFile({bundle, template, target});
			}
		},
	}
};