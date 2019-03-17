import {resolve, join} from "path";
import {
	defaultOutputConfig,
	defaultPlugins,
	defaultProdPlugins,
	defaultServePlugins,
	isProd,
	isServe
} from "./dist/lib/index.esm.js";

const folders = {
	dist: resolve(__dirname, "dist"),
	src: resolve(__dirname, "src/demo"),
	src_assets: resolve(__dirname, "src/demo/assets"),
	dist_assets: resolve(__dirname, "dist/assets")
};

const files = {
	main: join(folders.src, "main.ts"),
	src_index: join(folders.src, "index.html"),
	dist_index: join(folders.dist, "index.html")
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
				dist: folders.dist
			})
		] : [])

	],
	treeshake: isProd,
	context: "window"
}