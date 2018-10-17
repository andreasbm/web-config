import {createServer} from "livereload";
import {resolve} from "path";

/**
 * #########################################
 *  Disclaimer: This code is primarily from https://github.com/thgh/rollup-plugin-livereload
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
export default function livereload (config) {
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
		banner () {
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
		ongenerate () {
			if (verbose) {
				console.log(green(`[livereload] - Enabled`))
			}
		}
	}
}

/**
 * Turns the text green.
 * @param text
 * @returns {string}
 */
function green (text) {
	return '\u001b[1m\u001b[32m' + text + '\u001b[39m\u001b[22m'
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