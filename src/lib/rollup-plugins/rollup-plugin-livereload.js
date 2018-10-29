import {createServer} from "livereload";
import {resolve} from "path";
import colors from "colors";

/**
 * #########################################
 *  Disclaimer: This code is primarily from https://github.com/thgh/rollup-plugin-livereload
 *  I changed the code so it Rollup can also bundle Web Workers by checking whether the document is defined.
 * #########################################
 */

/**
 * Default configuration for the import livereload plugin.
 * @type {{plugins: Array, extensions: string[]}}
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
	if (Array.isArray(watch)) {
		server.watch(watch.map(w => resolve(process.cwd(), w)));

	} else {
		server.watch(resolve(process.cwd(), watch))
	}

	closeServerOnTermination(server);

	return {
		name: 'livereload',
		banner: () => {
			return `
			/* Livereload */
			if (typeof document !== 'undefined') {
				(function(doc, type, v, e) {
					v = doc.createElement(type);
					v.async = true;
					v.src = "//" + (location.host || "localhost").split(":")[0] + ":${port}/livereload.js?snipver=1";
					e = doc.getElementsByTagName(type)[0];
					e.parentNode.insertBefore(v, e)}
				)(document, "script");
			}`

		},
		generateBundle: () => {
			if (verbose) {
				console.log(colors.green(`[livereload] - Enabled`));
			}
		}
	}
}



/**
 * Subscribes the server to close when required.
 * @param server
 */
function closeServerOnTermination (server) {
	const terminationSignals = ["SIGINT", "SIGTERM"];
	terminationSignals.forEach((signal) => {
		process.on(signal, () => {
			server.close();
			process.exit();
		})
	})
}