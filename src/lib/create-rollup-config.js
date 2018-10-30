import cssnano from "cssnano";
import precss from 'precss';
import cleaner from 'rollup-plugin-cleaner';
import commonjs from 'rollup-plugin-commonjs';
import filesize from "rollup-plugin-filesize";
import json from 'rollup-plugin-json';
import license from "rollup-plugin-license";
import resolve from 'rollup-plugin-node-resolve';
import progress from 'rollup-plugin-progress';
import serve from 'rollup-plugin-serve'
import {terser} from "rollup-plugin-terser";
import ts from "@wessberg/rollup-plugin-ts";
import visualizer from 'rollup-plugin-visualizer';
import {copy} from './rollup-plugins/rollup-plugin-copy'
import {htmlTemplate} from "./rollup-plugins/rollup-plugin-html-template";
import {importStyles} from "./rollup-plugins/rollup-plugin-import-styles";
import {livereload} from './rollup-plugins/rollup-plugin-livereload'
import {minifyLitHTML} from "./rollup-plugins/rollup-plugin-minify-lit-html";
import {gzip} from "./rollup-plugins/rollup-plugin-gzip";

// Information about the environment.
export const isProd = process.env.NODE_ENV === "prod";
export const isDev = process.env.NODE_ENV === "dev";
export const isLibrary = process.env.NODE_ENV === "library";
export const isServe = process.env.ROLLUP_WATCH || false;

/**
 * Returns the config or an empty default.
 * @param config
 * @returns {*|{}}
 */
const configOrDefault = (config) => {
	return config || {}
};

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
export const defaultOutputConfig = (config = {}) => {
	// format: (system, amd, cjs, esm, iife, umd)
	return {
		entryFileNames: "[name]-[hash].js",
		chunkFileNames: "[name]-[hash].js",
		sourcemap: true,
		...configOrDefault(config)
	}
};

/**
 * Default plugins for resolve.
 **/
export const defaultResolvePlugins = ({importStylesConfig, jsonConfig, resolveConfig, tsConfig, commonjsConfig} = {}) => [

	// Teaches Rollup how to find external modules
	resolve({
		module: true,
		browser: true,
		jsnext: true,
		main: false,
		modulesOnly: false,
		...configOrDefault(resolveConfig)
	}),

	// Teaches Rollup how to import styles when using the "import css from "./styles.scss" syntax.
	importStyles({
		plugins: scssPlugins,
		...configOrDefault(importStylesConfig)
	}),

	// Teaches Rollup how to transpile Typescript
	// https://github.com/wessberg/rollup-plugin-ts
	ts({
		browserslist: false,
		...configOrDefault(tsConfig)
	}),

	// At the moment, the majority of packages on NPM are exposed as CommonJS modules
	commonjs({
		include: "**/node_modules/**",
		...configOrDefault(commonjsConfig)
	}),

	// Teaches Rollup how to import json files
	json({
		preferConst: true,
		compact: true,
		...configOrDefault(jsonConfig)
	})
];

/**
 * Default configuration for the plugins that runs every time the bundle is created.
 */
export const defaultPlugins = ({cleanerConfig, copyConfig, importStylesConfig, jsonConfig, htmlTemplateConfig, resolveConfig, progressConfig, tsConfig, commonjsConfig} = {}) => [

	// Shows a progress indicator while building
	progress({
		...configOrDefault(progressConfig)
	}),

	// Cleans the dist folder to get rid of files from the previous build
	cleaner({
		...configOrDefault(cleanerConfig)
	}),

	...defaultResolvePlugins({
		importStylesConfig,
		jsonConfig,
		resolveConfig,
		tsConfig,
		commonjsConfig
	}),

	// Copies resources
	copy({
		...configOrDefault(copyConfig)
	}),

	// Creates a HTML template with the injected scripts from the entry points
	htmlTemplate({
		...configOrDefault(htmlTemplateConfig)
	})
];

/**
 * Default plugins that only run when the bundle is being served.
 */
export const defaultServePlugins = ({serveConfig, livereloadConfig} = {}) => [

	// Serves the application files
	serve({
		open: true,
		historyApiFallback: true,
		host: "localhost",
		headers: {
			"Access-Control-Allow-Origin": "*",
		},
		...configOrDefault(serveConfig)
	}),

	// Reloads the page when run in watch mode
	livereload({
		...configOrDefault(livereloadConfig)
	})
];

/**
 * Default plugins that only run when the bundle is being created in prod mode.
 */
export const defaultProdPlugins = ({dist, minifyLitHtmlConfig, licenseConfig, terserConfig, filesizeConfig, visualizerConfig, gzipConfig} = {}) => [

	// Minifies the lit-html files
	minifyLitHTML({
		...configOrDefault(minifyLitHtmlConfig)
	}),

	// Collects all the license files
	license({
		sourceMap: true,
		includePrivate: true,
		...configOrDefault(licenseConfig)
	}),

	// Minifies the code
	terser({
		...configOrDefault(terserConfig)
	}),

	// Prints the total file-size in the console
	filesize({
		...configOrDefault(filesizeConfig)
	}),

	// Create a HTML file visualizing the size of each module
	visualizer({
		sourcemap: true,
		...configOrDefault(visualizerConfig)
	}),

	// Gzips all of the files
	gzip({
		...configOrDefault(gzipConfig)
	})
];

/**
 * Default external dependencies.
 */
export const defaultExternals = (pkg = {}) => [
	...Object.keys(configOrDefault(pkg.dependencies)),
	...Object.keys(configOrDefault(pkg.devDependencies))
];