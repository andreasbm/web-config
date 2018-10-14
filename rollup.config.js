import cssnano from "cssnano";
import {builtinModules} from "module";
import path from "path";
import postcssPresetEnv from "postcss-preset-env";
import readdir from "recursive-readdir-sync";
import babel from 'rollup-plugin-babel';
import cleaner from 'rollup-plugin-cleaner';
import copy from 'rollup-plugin-copy';
import filesize from "rollup-plugin-filesize";
import gzip from "rollup-plugin-gzip";
import license from "rollup-plugin-license";
import livereload from 'rollup-plugin-livereload'
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import serve from 'rollup-plugin-serve'
import {terser} from "rollup-plugin-terser";
import ts from 'rollup-plugin-typescript2';
import pkg from "./package.json";
import htmlTemplate from "./rollup-plugins/rollup-plugin-html-template";
import importSCSS from "./rollup-plugins/rollup-plugin-import-scss";
import progress from 'rollup-plugin-progress';
import visualizer from 'rollup-plugin-visualizer';
import litHTML from "./rollup-plugins/rollup-plugin-lit-html";

const isProd = process.env.NODE_ENV === "prod";
const isDev = process.env.NODE_ENV === "dev";
const isLibrary = process.env.NODE_ENV === "library";
const isServe = process.env.ROLLUP_WATCH || false;

const folders = {
	dist: path.resolve(__dirname, "dist"),
	src: path.resolve(__dirname, "src"),
	src_assets: path.resolve(__dirname, "src/assets"),
	dist_assets: path.resolve(__dirname, "dist/assets")
};

const files = {
	main: path.join(folders.src, "main.ts"),
	index: path.join(folders.src, "index.html")
};

console.log({isProd, isDev, isLibrary, isServe});

const scssPlugins = [
	postcssPresetEnv(),

	...(isProd ? [
		cssnano()
	] : [])
];

//console.log(process.argv, process.env);
export default {
	input: {
		main: files.main
	},
	output: [
		{
			dir: folders.dist,
			entryFileNames: "[name]-[hash].js",
			chunkFileNames: "[name]-[hash][extname]",
			format: "esm",
			sourcemap: true
		}
	],
	plugins: [

		// Shows a progress indicator while building
		progress(),

		// Cleans the dist folder to get rid of files from the previous build
		cleaner({
			targets: [
				folders.dist
			]
		}),

		// Teaches Rollup how to import SCSS when using the "import css from "./styles.scss" syntax.
		importSCSS({
			plugins: scssPlugins,
		}),

		// Teaches Rollup how to find external modules
		resolve({
			module: true,
			browser: true,
			jsnext: true,
			main: false,
			modulesOnly: true
		}),

		// At the moment, the majority of packages on NPM are exposed as CommonJS modules
		commonjs({
			include: "node_modules/**",
		}),

		// Teaches Rollup how to transpile Typescript
		ts(),

		// Teaches Rollup how to transpile code by looking at the .browserslistrc config
		babel({
			exclude: 'node_modules/**',
		}),

		// Minifies the lit-html files
		litHTML(),

		// Copies resources to the dist folder
		copy([
			[folders.src_assets, folders.dist_assets]
		].reduce((acc, [from, to]) => {
			acc[from] = to;
			return acc;
		}, {})),

		// Create a HTML template with the injected scripts from the entry points
		htmlTemplate({
			template: path.join(folders.src, "index.html"),
			target: path.join(folders.dist, "index.html")
		}),

		// Serve
		...(isServe ? [

			// Serves the application files
			serve({
				open: true,
				contentBase: folders.dist,
				historyApiFallback: true,
				host: "localhost",
				port: 1337,
				headers: {
					"Access-Control-Allow-Origin": "*",
				}
			}),

			// Reloads the page when run in watch mode
			livereload({
				watch: folders.dist
			})
		] : []),

		// Production
		...(isProd ? [

			// Collects all the license files
			license({
				sourceMap: true,
				includePrivate: true,
				thirdParty: {
					output: path.join(folders.dist, "licenses.txt")
				}
			}),

			// Minifies the code
			terser(),

			// Gzips all of the files
			gzip({
				// TODO: Figure out why it the copied files (eg. assets) are not gzipped.
				// The additional files should contain all the assets...
				filter: () => false,
				gzipOptions: {
					level: 9
				},
				additionalFiles: readdir(folders.dist).filter(path => !path.endsWith(".gz"))
			}),

			// Prints the total file-size in the console
			filesize(),

			// Create a HTML file visualizing the size of each module
			visualizer({
				filename: path.join(folders.dist, "stats.html"),
				sourcemap: true
			})
		] : [])

	],
	external: [
		...(isLibrary ? [
			...Object.keys(pkg.dependencies || {}),
			...Object.keys(pkg.devDependencies || {}),
			...builtinModules
		] : [])
	],
	experimentalCodeSplitting: true,
	treeshake: true,
	context: "window"
}