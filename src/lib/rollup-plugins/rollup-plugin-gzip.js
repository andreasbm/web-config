import colors from "colors";
import readdir from "recursive-readdir-sync";
import targz from "targz";

const defaultConfig = {
	verbose: true,
	gzipOptions: {},

	// We need a timeout to make sure all files have been bundled
	timeout: 2000
};

/**
 * Gzips all files in the dist folder.
 * @param config
 * @returns {{name: string, generateBundle: generateBundle}}
 */
export function gzip (config) {
	const {verbose, dir, timeout, gzipOptions} = {...defaultConfig, ...config};

	return {
		name: "gzip",
		generateBundle: async (outputOptions, bundle, isWrite) => {
			if (!isWrite) return;

			// Start the timeout to make sure the rollup bundle and all of the files
			// will be in the target folder when we are compressing.
			setTimeout(() => {

				// Grab the files from the build folder
				const target = dir || outputOptions.dir;
				const files = readdir(target).filter(path => !path.endsWith(".gz"));

				// Compress all files
				for (const src of files) {
					const dest = `${src}.gz`;
					targz.compress({
						src, dest,
						...gzipOptions
					}, ex => {
						if (verbose && ex != null) {
							console.log(colors.yellow(`[gzip] - Could not compress "${src}" to "${dest}"\n`, ex));
						}
					});
				}

				// Tell the user that everything went fine
				if (verbose) {
					console.log(colors.green(`[gzip] - Successfully compressed ${files.length} files`));
				}

			}, timeout);
		}
	};
}

