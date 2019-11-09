import { compress as brotliCompress } from "brotli";
import { yellow, green } from "colors";
import { appendFile, readFileSync } from "fs-extra";
import readdir from "recursive-readdir-sync";
import { OutputBundle, OutputOptions } from "rollup";
import { createFilter } from "rollup-pluginutils";
import { compress as tagzCompress } from "targz";

export type Compressor = ({ src, verbose }: { src: string; verbose: boolean }) => void;

export interface IRollupPluginCompressConfig {
	verbose: boolean;
	include: (string | RegExp)[] | string | RegExp | null;
	exclude: (string | RegExp)[] | string | RegExp | null;
	compressors: Compressor[];
	dir?: string;

	// We need a timeout to make sure all files have been bundled
	timeout: number;
}

const defaultConfig: IRollupPluginCompressConfig = {
	verbose: true,
	include: [],
	exclude: [],
	compressors: [compressGzip, compressBrotli],
	timeout: 2000
};

/**
 * Compresses a file using gzip.
 * @param src
 * @param verbose
 */
export function compressGzip({ src, verbose }: { src: string; verbose: boolean }) {
	const dest = `${src}.gz`;
	tagzCompress(
		{
			src,
			dest
		},
		(err: Error) => {
			if (verbose && err != null) {
				console.log(yellow(`[gzip] - Could not compress "${src}" to "${dest}"\n`), err);
			}
		}
	);
}

/**
 * Compresses a file using brotli.
 * @param src
 * @param verbose
 */
export function compressBrotli({ src, verbose }: { src: string; verbose: boolean }) {
	const buffer = brotliCompress(readFileSync(src));
	const dest = `${src}.br`;

	appendFile(dest, buffer, (err: Error) => {
		if (verbose && err != null) {
			console.log(yellow(`[brotli] - Could not compress "${src}" to "${dest}"\n`), err);
		}
	});
}

/**
 * A Rollup plugin that compresses the files in the bundle after building.
 * @param config
 * @returns {{name: string, generateBundle: generateBundle}}
 */
export function compress(config: Partial<IRollupPluginCompressConfig> = {}) {
	const { verbose, dir, timeout, compressors, include, exclude } = { ...defaultConfig, ...config };
	const filter = createFilter(include, exclude);

	return {
		name: "compress",
		generateBundle: (outputOptions: OutputOptions, bundle: OutputBundle, isWrite: boolean): void => {
			if (!isWrite) return;

			// Start the timeout to make sure the rollup bundle and all of the files
			// will be in the target folder when we are compressing.
			setTimeout(() => {
				// Grab the files from the build folder
				const target = dir || outputOptions.dir;
				const files = readdir(target).filter((path: string) => !path.endsWith(".gz") && filter(path));

				// Compress all files
				for (const src of files) {
					for (const compress of compressors) {
						compress({ src, verbose });
					}
				}

				// Tell the user that everything went fine
				if (verbose) {
					console.log(green(`[compress] - Successfully compressed ${files.length} files`));
				}
			}, timeout);
		}
	};
}
