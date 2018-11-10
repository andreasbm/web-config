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
		(function(doc, id) {
		
			/* Ensure that a script does not exist in the doc yet  */
			var $container = doc.head || doc.body;
			if ($container.querySelector("#" + id) != null) {
				return;
			}
	
			/* Create script that takes care of reloading each time a watched file changes */
			var $script = doc.createElement("script");
			$script.async = true;
			$script.id = id;
			$script.src = "//" + (location.host || "localhost").split(":")[0] + ":${port}/livereload.js?snipver=1";
			
			/* Inject the script as the first one */
			$container.insertBefore($script, $container.firstChild);
			
		})(document, "rollup-plugin-livereload");
	}`
}

/**
 * Subscribes the server to terminate when required.
 * @param server
 */
function attachTerminationListeners (server) {

	// Hook up listeners that kills the server if the process is terminated for some reason
	const terminationSignals = ["SIGINT", "SIGTERM", "SIGQUIT"];
	for (const signal of terminationSignals) {
		process.on(signal, () => killServer(server));
	}

	// Rethrow the error
	server.on("error", err => {
		server.close();
		throw err;
	});
}

/**
 * Tears down the server.
 * @param server
 */
function killServer (server) {
	server.close();
	process.exit();
}