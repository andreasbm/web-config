import ts, { TypescriptPluginOptions } from "@wessberg/rollup-plugin-ts";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import precss from "precss";
import { OutputOptions } from "rollup";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import license from "rollup-plugin-license";
import resolve from "rollup-plugin-node-resolve";
import progress from "rollup-plugin-progress";
import serve from "rollup-plugin-serve";
import { terser } from "rollup-plugin-terser";
import visualizer from "rollup-plugin-visualizer";
import { budget, IRollupPluginBudgetConfig } from "./rollup-plugins/budget/rollup-plugin-budget";
import { clean, IRollupPluginCleanConfig } from "./rollup-plugins/clean/rollup-plugin-clean";
import { compress, IRollupPluginCompressConfig } from "./rollup-plugins/compress/rollup-plugin-compress";
import { copy, IRollupPluginCopyConfig } from "./rollup-plugins/copy/rollup-plugin-copy";
import { htmlTemplate, IRollupPluginHtmlTemplateConfig } from "./rollup-plugins/html-template/rollup-plugin-html-template";
import { importStyles, IRollupPluginImportStylesConfig } from "./rollup-plugins/import-styles/rollup-plugin-import-styles";
import { livereload } from "./rollup-plugins/live-reload/rollup-plugin-livereload";
import { IRollupPluginMinifyLitHtml, minifyLitHTML } from "./rollup-plugins/minify-lit-html/rollup-plugin-minify-lit-html";
import { IRollupPluginReplaceConfig, replace } from "./rollup-plugins/replace/rollup-plugin-replace";
import {join} from "path";

export interface IDefaultResolvePlugins {
	importStylesConfig: Partial<IRollupPluginImportStylesConfig>;
	replaceConfig: Partial<IRollupPluginReplaceConfig>;
	tsConfig: TypescriptPluginOptions;
	commonjsConfig: any;
	jsonConfig: any;
	resolveConfig: any;
}

export interface IDefaultPlugins extends IDefaultResolvePlugins{
	copyConfig: Partial<IRollupPluginCopyConfig>;
	htmlTemplateConfig: Partial<IRollupPluginHtmlTemplateConfig>;
	replaceConfig: Partial<IRollupPluginReplaceConfig>;
	cleanConfig: Partial<IRollupPluginCleanConfig>
	progressConfig: any;
}

export interface IDefaultProdPlugins {
	minifyLitHtmlConfig: Partial<IRollupPluginMinifyLitHtml>;
	budgetConfig: Partial<IRollupPluginBudgetConfig>;
	compressConfig: Partial<IRollupPluginCompressConfig>;
	dist: string;
	licenseConfig: any;
	terserConfig: any;
	visualizerConfig: any;
}

// Information about the environment.
export const isProd = process.env.NODE_ENV === "prod" || process.env.NODE_ENV === "production";
export const isDev = process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "development";
export const isLibrary = process.env.NODE_ENV === "lib" || process.env.NODE_ENV === "library";
export const isServe = process.env.ROLLUP_WATCH || false;

/**
 * Returns the config or an empty default.
 * @param config
 */
const configOrDefault = <T> (config: T | null | undefined): T => {
	return config || <T>{};
};

/**
 * The default scss plugins.
 */
export const postcssPlugins = [
	precss(),
	autoprefixer(),

	...(isProd ? [
		// Currently there's an issue with nested calcs and custom variables.
		// It can be reproduces by entering the following in https://cssnano.co/playground/: font-size: calc(var(--padding, calc(24 * var(--base-size, 1px))) + 1);
		// cssnano uses the following postcss plugins: https://cssnano.co/guides/optimisations.
		// https://cssnano.co/optimisations/calc is therefore probably the cause for this issue.
		// Read here for configuration: https://cssnano.co/guides/presets
		cssnano({
			preset: ["default", {
				calc: false
			}]
		})
	] : [])
];

/**
 * Default configuration for the output.
 * @param config
 */
export const defaultOutputConfig = (config: Partial<OutputOptions>) => {
	// format: (system, amd, cjs, esm, iife, umd)
	return {
		entryFileNames: "[name]-[hash].js",
		chunkFileNames: "[name]-[hash].js",
		sourcemap: true,
		format: "esm",
		...configOrDefault(config)
	};
};

/**
 * Default plugins for resolve.
 * @param importStylesConfig
 * @param replaceConfig
 * @param tsConfig
 * @param commonjsConfig
 * @param jsonConfig
 * @param resolveConfig
 */
export const defaultResolvePlugins = ({importStylesConfig, jsonConfig, resolveConfig, tsConfig, commonjsConfig, replaceConfig}: Partial<IDefaultResolvePlugins> = {}) => [

	// Teaches Rollup what files should be replaced
	replace({
		...configOrDefault(replaceConfig)
	}),

	// Teaches Rollup how to find external modules
	// https://github.com/rollup/rollup-plugin-node-resolve
	resolve({
		modulesOnly: false,
		mainFields: [
			"module",
			"browser",
			"jsnext:main"
		],
		...configOrDefault(resolveConfig)
	}),

	// Teaches Rollup how to import styles when using the "import css from "./styles.scss" syntax.
	importStyles({
		plugins: postcssPlugins,
		...configOrDefault(importStylesConfig)
	}),

	// Teaches Rollup how to import json files
	json({
		preferConst: true,
		compact: true,
		...configOrDefault(jsonConfig)
	}),

	// Teaches Rollup how to transpile Typescript
	// https://github.com/wessberg/rollup-plugin-ts
	ts({
		transpiler: "babel",
		...configOrDefault(tsConfig)
	}),

	// At the moment, the majority of packages on NPM are exposed as CommonJS modules
	commonjs({
		include: "**/node_modules/**",
		...configOrDefault(commonjsConfig)
	})
];

/**
 * Default configuration for the plugins that runs every time the bundle is created.
 * @param cleanConfig
 * @param copyConfig
 * @param importStylesConfig
 * @param jsonConfig
 * @param htmlTemplateConfig
 * @param resolveConfig
 * @param progressConfig
 * @param tsConfig
 * @param commonjsConfig
 * @param replaceConfig
 */
export const defaultPlugins = ({cleanConfig, copyConfig, importStylesConfig, jsonConfig, htmlTemplateConfig, resolveConfig, progressConfig, tsConfig, commonjsConfig, replaceConfig}: Partial<IDefaultPlugins> = {}) => [

	// Shows a progress indicator while building
	progress({
		...configOrDefault(progressConfig)
	}),

	// Cleans the dist folder to get rid of files from the previous build
	clean({
		...configOrDefault(cleanConfig)
	}),

	// Teach rollup how to resolve imports
	...defaultResolvePlugins({
		importStylesConfig,
		jsonConfig,
		resolveConfig,
		tsConfig,
		commonjsConfig,
		replaceConfig
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
 * @param dist
 * @param serveConfig
 * @param livereloadConfig
 */
export const defaultServePlugins = ({dist, serveConfig, livereloadConfig}: any = {}) => [

	// Serves the application files
	serve({
		open: true,
		port: 1337,
		historyApiFallback: true,
		host: "localhost",
		headers: {
			"Access-Control-Allow-Origin": "*"
		},
		...(dist != null ? {contentBase: dist} : {}),
		...configOrDefault(serveConfig)
	}),

	// Reloads the page when run in watch mode
	livereload({
		...(dist != null ? {watch: dist} : {}),
		...configOrDefault(livereloadConfig)
	})
];

/**
 * Default plugins that only run when the bundle is being created in prod mode.
 * @param dist
 * @param minifyLitHtmlConfig
 * @param licenseConfig
 * @param terserConfig
 * @param budgetConfig
 * @param visualizerConfig
 * @param compressConfig
 */
export const defaultProdPlugins = ({dist, minifyLitHtmlConfig, licenseConfig, terserConfig, budgetConfig, visualizerConfig, compressConfig}: Partial<IDefaultProdPlugins> = {}) => [

	// Minifies the lit-html files
	minifyLitHTML({
		...configOrDefault(minifyLitHtmlConfig)
	}),

	// Collects all the license files
	license({
		sourcemap: true,
		...(dist != null ? {thirdParty: {output: join(dist, "licenses.txt")}} : {}),
		...configOrDefault(licenseConfig)
	}),

	// Minifies the code
	terser({
		output: {
			// Don't preserve any comments, we create a license.txt instead.
			comments: () => false,
		},
		...configOrDefault(terserConfig)
	}),

	// Prints the budget and sizes of the files to the console
	budget({
		...configOrDefault(budgetConfig)
	}),

	// Create a HTML file visualizing the size of each module
	visualizer({
		sourcemap: true,
		...(dist != null ? {filename: join(dist, "stats.html")} : {}),
		...configOrDefault(visualizerConfig)
	}),

	// Compresses all of the files
	compress({
		...configOrDefault(compressConfig)
	})
];

/**
 * Default external dependencies.
 * @param dependencies
 * @param devDependencies
 * @param peerDependencies
 */
export const defaultExternals = ({dependencies, devDependencies, peerDependencies}: {dependencies?: string[], devDependencies?: string[], peerDependencies?: string[]}) => [
	...Object.keys(configOrDefault(dependencies)),
	...Object.keys(configOrDefault(devDependencies)),
	...Object.keys(configOrDefault(peerDependencies))
];