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
import builtins from 'rollup-plugin-node-builtins';
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
import minifyLitHTML from "./rollup-plugins/rollup-plugin-minify-lit-html";

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
	main: path.join(folders.src, "test.ts"),
	src_index: path.join(folders.src, "index.html"),
	dist_index: path.join(folders.dist, "index.html")
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
			format: "es", // (amd, cjs, esm, iife, umd)
			sourcemap: true
		}
	],
	plugins: [

		// Cleans the dist folder to get rid of files from the previous build
		cleaner({
			targets: [
				folders.dist
			]
		}),

		// Teaches Rollup how to find external modules
		resolve({
			module: true,
			browser: true,
			jsnext: true,
			main: false,
			modulesOnly: false
		}),

		// At the moment, the majority of packages on NPM are exposed as CommonJS modules
		commonjs({
			include: "**/node_modules/**",
		}),

		ts(),

		// Teaches Rollup how to transpile code by looking at the .babelrc config
		// Documentation: https://babeljs.io/docs/en/index.html
		babel({
			exclude: "**/node_modules/**",
			runtimeHelpers: true,
			//externalHelpers: true,
			extensions: [".ts", ".js"]
		}),

		// Trying to get it to work..
		builtins(),
	],
	external: [
		...(isLibrary ? [
			...Object.keys(pkg.dependencies || {}),
			...Object.keys(pkg.devDependencies || {}),
			...builtinModules
		] : [])
	],
	experimentalCodeSplitting: true,
	//treeshake: isProd,
	context: "window"
}