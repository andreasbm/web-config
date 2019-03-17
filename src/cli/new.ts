import prompts from "prompts";

const NPM_ID = `@appnest/web-config`;
const names = {
	MAIN_TS: `main.ts`,
	INDEX_HTML: `index.html`,
	MAIN_SCSS: `main.scss`,
	ROLLUP_CONFIG: `rollup.config.js`
};

interface IInputConfig {
	dist: string;
	src: string;
}

async function getInputConfig (): Promise<IInputConfig> {
	return await prompts([
		{
			type: "text",
			name: "dist",
			message: `Where's the dist folder located?`,
			initial: `dist`
		},
		{
			type: "text",
			name: "src",
			message: `Where's the src folder located?`,
			initial: `src`
		}
	], {
		onCancel: () => {
			process.exit(1);
		}
	});
}

// Step 1 - Installation
function installWebConfig (config: IInputConfig) {
	// TODO: Install @appnest/web-config
}

// Step 2 - Setup rollup.config.js
function setupRollup (config: IInputConfig) {
	const content = `import {resolve, join} from "path";
import {
	defaultOutputConfig,
	defaultPlugins,
	defaultProdPlugins,
	defaultServePlugins,
	isProd,
	isServe
} from "${NPM_ID}";

const folders = {
	dist: resolve(__dirname, "${config.dist}"),
	src: resolve(__dirname, "${config.src}"),
	src_assets: resolve(__dirname, "${config.src}/assets"),
	dist_assets: resolve(__dirname, "${config.dist}/assets")
};

const files = {
	main: join(folders.src, "${names.MAIN_TS}"),
	src_index: join(folders.src, "${names.INDEX_HTML}"),
	dist_index: join(folders.dist, "${names.INDEX_HTML}")
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
				include: /main(-.*)?\\.js$/
			},
			importStylesConfig: {
				globals: ["${names.MAIN_SCSS}"]
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
}`;
}

// Step 3 - Setup tslint.json
function setupTslint (config: IInputConfig) {

}

// Step 4 - Setup tsconfig.json
function setupTsconfig (config: IInputConfig) {

}

// Step 5 - Setup .browserslistrc
function setupBrowserslist (config: IInputConfig) {

}

// Step 6 - Setup karma.conf.js
function setupKarma (config: IInputConfig) {

}

// Step 7 - Add start and build scripts to package.json
function setupScripts (config: IInputConfig) {

}

// // Step 8 - Setup typings
function setupTypings (config: IInputConfig) {

}

export async function newCommand ({dir}: {dir: string}) {
	console.log(dir);
	const config = await getInputConfig();
	console.log(config);
	installWebConfig(config);
	setupRollup(config);
	setupTslint(config);
	setupTsconfig(config);
	setupBrowserslist(config);
	setupKarma(config);
	setupScripts(config);
	setupTypings(config);
}
