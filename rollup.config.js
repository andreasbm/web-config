import path from "path";
import pkg from "./package.json";
import {
	defaultExternals,
	defaultOutputConfig,
	defaultPlugins,
	defaultProdPlugins,
	defaultServePlugins,
	isLibrary,
	isProd,
	isServe
} from "./src/lib/create-rollup-config.js";

const folders = {
	dist: path.resolve(__dirname, "dist"),
	src: path.resolve(__dirname, "src/demo"),
	src_assets: path.resolve(__dirname, "src/demo/assets"),
	dist_assets: path.resolve(__dirname, "dist/assets")
};

const files = {
	main: path.join(folders.src, "main.ts"),
	src_index: path.join(folders.src, "index.html"),
	dist_index: path.join(folders.dist, "index.html")
};

export default {
	input: {
		main: files.main
	},
	output: [
		defaultOutputConfig({
			format: "esm",
			dist: folders.dist
		})
	],
	plugins: [
		...defaultPlugins({
			targets: [
				folders.dist
			],
			resources: [[folders.src_assets, folders.dist_assets]],
			htmlTemplateConfig: {
				template: files.src_index,
				target: files.dist_index,
				include: /main(-.*)?\.js$/
			},
			importStylesConfig: {
				globals: ["main.scss"]
			}
		}),

		// Serve
		...(isServe ? [
			...defaultServePlugins({
				serveConfig: {
					port: 1338,
					contentBase: folders.dist
				},
				livereloadConfig: {
					watch: folders.dist
				}
			})
		] : []),

		// Production
		...(isProd ? [
			...defaultProdPlugins({
				dist: folders.dist,
				visualizerConfig: {
					filename: path.join(folders.dist, "stats.html")
				}
			})
		] : [])

	],
	external: [
		...(isLibrary ? [
			...defaultExternals(pkg)
		] : [])
	],
	experimentalCodeSplitting: true,
	treeshake: isProd,
	context: "window"
}