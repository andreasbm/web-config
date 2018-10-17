import cssnano from "cssnano";
import {builtinModules} from "module";
import path from "path";
import babel from 'rollup-plugin-babel';
import cleaner from 'rollup-plugin-cleaner';
import commonjs from 'rollup-plugin-commonjs';
import copy from 'rollup-plugin-copy';
import filesize from "rollup-plugin-filesize";
import license from "rollup-plugin-license";
import livereload from 'rollup-plugin-livereload'
import resolve from 'rollup-plugin-node-resolve';
import progress from 'rollup-plugin-progress';
import serve from 'rollup-plugin-serve'
import {terser} from "rollup-plugin-terser";
import ts from 'rollup-plugin-typescript2';
import visualizer from 'rollup-plugin-visualizer';
import htmlTemplate from "./rollup-plugins/rollup-plugin-html-template";
import importStyles from "./rollup-plugins/rollup-plugin-import-styles";
import minifyLitHTML from "./rollup-plugins/rollup-plugin-minify-lit-html";
import precss from 'precss';

// Information about the environment.
export const isProd = process.env.NODE_ENV === "prod";
export const isDev = process.env.NODE_ENV === "dev";
export const isLibrary = process.env.NODE_ENV === "library";
export const isServe = process.env.ROLLUP_WATCH || false;

/**
 * The default scss plugins.
 */
export const scssPlugins = [
	precss(),

	...(isProd ? [
		cssnano()
	] : [])
];

/**
 * Default configuration for the output.
 */
export const defaultOutputConfig = (config) => {
	// format: (system, amd, cjs, esm, iife, umd)
	return {
		entryFileNames: "[name]-[hash].js",
		chunkFileNames: "[name]-[hash][extname]",
		sourcemap: true,
		...config
	}
};

/**
 * Default configuration for the plugins that runs every time the bundle is created.
 */
export const defaultPlugins = ({cleanerConfig, resources, importStylesConfig, htmlTemplateConfig, resolveConfig, progressConfig, tsConfig, commonjsConfig}) => [

	// Shows a progress indicator while building
	progress({
		...progressConfig
	}),

	// Cleans the dist folder to get rid of files from the previous build
	cleaner({
		...cleanerConfig
	}),

	// Teaches Rollup how to find external modules
	resolve({
		module: true,
		browser: true,
		jsnext: true,
		main: false,
		modulesOnly: false,
		...resolveConfig
	}),

	// Teaches Rollup how to import styles when using the "import css from "./styles.scss" syntax.
	importStyles({
		plugins: scssPlugins,
		...importStylesConfig
	}),

	// Teaches Rollup how to transpile Typescript
	ts({
		clean: true,
		...tsConfig
	}),

	// At the moment, the majority of packages on NPM are exposed as CommonJS modules
	commonjs({
		include: "**/node_modules/**",
		...commonjsConfig
	}),

	// Teaches Rollup how to transpile code by looking at the .babelrc config
	// Documentation: https://babeljs.io/docs/en/index.html
	// TODO: Fix Uncaught TypeError: Class constructor LitElement cannot be invoked without 'new' on serve
	// babel({
	// 	exclude: "**/node_modules/**",
	// 	runtimeHelpers: true,
	// 	externalHelpers: true,
	// 	extensions: [".ts", ".js"]
	// }),

	// Copies resources to the dist folder
	copy(resources.reduce((acc, [from, to]) => {
		acc[from] = to;
		return acc;
	}, {})),

	// Creates a HTML template with the injected scripts from the entry points
	htmlTemplate({
		...htmlTemplateConfig
	})
];

/**
 * Default plugins that only run when the bundle is being served.
 */
export const defaultServePlugins = ({serveConfig, livereloadConfig}) => [

	// Serves the application files
	serve({
		open: true,
		historyApiFallback: true,
		host: "localhost",
		headers: {
			"Access-Control-Allow-Origin": "*",
		},
		...serveConfig
	}),

	// Reloads the page when run in watch mode
	livereload({
		...livereloadConfig
	})
];

/**
 * Default plugins that only run when the bundle is being created in prod mode.
 */
export const defaultProdPlugins = ({dist, minifyLitHtmlConfig, licenseConfig, terserConfig, filesizeConfig, visualizerConfig}) => [

	// Minifies the lit-html files
	minifyLitHTML({
		...minifyLitHtmlConfig
	}),

	// Collects all the license files
	license({
		sourceMap: true,
		includePrivate: true,
		...licenseConfig
	}),

	// Minifies the code
	terser({
		...terserConfig
	}),

	// Gzips all of the files
	/*gzip({
		// TODO: Figure out why it the copied files (eg. assets) are not gzipped.
		// The additional files should contain all the assets...
		filter: () => false,
		gzipOptions: {
			level: 9
		},
		additionalFiles: readdir(folders.dist).filter(path => !path.endsWith(".gz"))
	}),*/

	// Prints the total file-size in the console
	filesize({
		...filesizeConfig
	}),

	// Create a HTML file visualizing the size of each module
	visualizer({
		sourcemap: true,
		...visualizerConfig
	})
];

/**
 * Default external dependencies.
 */
export const defaultExternals = (pkg) => [
	...Object.keys(pkg.dependencies || {}),
	...Object.keys(pkg.devDependencies || {}),
	...builtinModules
];