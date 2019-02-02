import path from "path";
import {
	defaultOutputConfig,
	defaultPlugins,
	defaultProdPlugins,
	defaultServePlugins,
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
			dir: folders.dist,
			format: "esm"
		})
	],
	plugins: [
		...defaultPlugins({
			replaceConfig: {
				resources: [
					(isProd ?
						[path.resolve(__dirname, "src/demo/env.ts"), path.resolve(__dirname, "src/demo/env.prod.ts")]
					: [])
				]
			},
			copyConfig: {
				resources: [[folders.src_assets, folders.dist_assets]]
			},
			cleanerConfig: {
				targets: [
					folders.dist
				]
			},
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
				dist: folders.dist
			})
		] : []),

		// Production
		...(isProd ? [
			...defaultProdPlugins({
				dist: folders.dist,
				minifyLitHtmlConfig: {
					include: [/my-component.ts$/]
				}
			})
		] : [])
	],
	treeshake: isProd,
	context: "window"
}