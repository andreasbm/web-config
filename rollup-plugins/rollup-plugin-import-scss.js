import MagicString from "magic-string";
import postcss from "postcss";
import path from "path";

/**
 * Default configuration for the import SCSS plugin.
 * @type {{plugins: Array, extensions: string[]}}
 */
const defaultConfig = {
	plugins: [],
	extensions: [".css", ".scss"]
};

/**
 * Processes a SCSS file by running it through a processor and generating the code and its corresponding sourcemap.
 * @param code
 * @param id
 * @param processor
 * @returns {Promise<{code: string, map: string}>}
 */
function processFile ({code, id, processor}) {
	return new Promise(res => {
		const container = new MagicString(code);
		processor.process(container.toString(), { from: id }).then(result => {
			const css = result.css;
			container.overwrite(0, container.length(), `export default \`${css}\``);
			res({
				code: container.toString(),
				map: container.generateMap()
			})

		});
	});
}

/**
 * A Rollup plugin that makes it possible to import SCSS and CSS files using the "import css from 'styles.scss'" syntax.
 * @param config
 * @returns {{name: string, resolveId: resolveId, transform: transform}}
 */
export default function importSCSS (config) {
	const {plugins, extensions} = {...defaultConfig, ...config};

	// Generate a filter that determines whether the file should be handled by the plugin or not.
	const filter = (id) => extensions.find(ext => id.endsWith(ext)) != null;

	// Create the postcss processor based on the plugins.
	const processor = postcss(plugins);

	return {
		name: 'importSCSS',
		resolveId: (id, importer) => {
			if (importer && filter(id)) {
				return path.resolve(path.dirname(importer), id)
			}

			return null;
		},
		transform: (code, id) => {
			if (filter(id)) {
				return processFile({code, id, processor});
			}

			return null;
		}
	}
};