import {createServer} from "livereload";
import {resolve} from "path";
import colors from "colors";

/**
 * #########################################
 *  This code is primarily from https://github.com/thgh/rollup-plugin-livereload
 *  I changed the code so it Rollup can also bundle Web Workers by checking whether the document is defined.
 * #########################################
 */

/**
 * Default configuration for the livereload plugin.
 * @type {{watch: string, port: number, verbose: boolean}}
 */
const defaultConfig = {
	watch: "dist",
	port: 35729,
	verbose: true
};


/**
 * Plugin for livereloading files.
 * @param config
 * @returns {*}
 */
export function livereload (config) {
	const {watch, port, verbose} = {...defaultConfig, ...config};

	// Start watching the files
	const server = createServer({watch, port, verbose});
	const paths = Array.isArray(watch) ? watch : [watch];
	server.watch(paths.map(p => resolve(process.cwd(), p)));
	attachTerminationListeners(server);

	return {
		name: 'livereload',
		banner: () => livereloadHtml(port),
		generateBundle: () => {
			if (verbose) {
				console.log(colors.green(`[livereload] - Enabled`));
			}
		}
	}
}

/**
 * Returns the livereload html.
 */
function livereloadHtml (port) {
	return `/* Livereload */
	if (typeof document !== 'undefined') {
		(function(doc, type, v, e) {
			v = doc.createElement(type);
			v.async = true;
			v.src = "//" + (location.host || "localhost").split(":")[0] + ":${port}/livereload.js?snipver=1";
			e = doc.getElementsByTagName(type)[0];
			e.parentNode.insertBefore(v, e)}
		)(document, "script");
	}`
}

/**
 * Subscribes the server to terminate when required.
 * @param server
 */
function attachTerminationListeners (server) {
	server.on("error", () => tearDownServer(server));
	const terminationSignals = ["SIGINT", "SIGTERM", "SIGQUIT"];
	for (const signal of terminationSignals) {
		process.on(signal, () => tearDownServer(server));
	}
}

/**
 * Tears down the server.
 * @param server
 */
function tearDownServer (server) {
	server.close();
	process.exit();
}