import { exec } from "child_process";
import { existsSync, mkdirpSync, outputFileSync } from "fs-extra";
import { join, resolve } from "path";
import prompts from "prompts";
import {red, green} from "colors";

const NPM_ID = `@appnest/web-config`;
const names = {
	MAIN_TS: `main.ts`,
	INDEX_HTML: `index.html`,
	MAIN_SCSS: `main.scss`,
	ROLLUP_CONFIG_JS: `rollup.config.js`,
	TS_LINT_JSON: `tslint.json`,
	TS_CONFIG_JSON: `tsconfig.json`,
	KARMA_CONFIG_JS: `karma.conf.js`,
	PACKAGE_JSON: `package.json`,
	TYPINGS_D_TS: `typings.d.ts`,
	BROWSERSLISTRC: `.browserslistrc`,
	GITIGNORE: `.gitignore`,
	ASSETS: `assets`
};

interface INewCommandConfig {
	dist: string;
	src: string;
	dir: string;
	overwrite: boolean;
	dry: boolean;
}

/**
 * Asks the user for input and returns a configuration object for the command.
 * @param dir
 */
async function getNewCommandConfig ({dir}: {dir: string}): Promise<INewCommandConfig> {
	const input = await prompts([
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
		},
		{
			type: "confirm",
			name: "overwrite",
			message: `Do you want to overwrite existing files?`,
			initial: true
		},
		{
			type: "confirm",
			name: "dry",
			message: `Do you want a dry run?`,
			initial: false
		}
	], {
		onCancel: () => {
			process.exit(1);
		}
	});

	return {...input, dir};
}

/**
 * Writes a file to the correct path.
 * @param name
 * @param content
 * @param config
 */
function writeFile (name: string, content: string, config: INewCommandConfig) {
	const path = join(resolve(process.cwd(), config.dir), name);

	// Check if the file exists and if we should then abort
	if (!config.overwrite && existsSync(path)) {
		return;
	}

	console.log(green(`Creating "${name}"`));

	// Check if the command is dry.
	if (config.dry) {
		console.log(content);
		return;
	}

	outputFileSync(path, content);
}

/**
 * Runs a command.
 * @param cmd
 */
function run (cmd: string): Promise<void> {
	return new Promise((res, rej) => {
		exec(cmd, error => {
			if (error !== null) {
				return rej(error);
			}

			res();
		});
	});
}

/**
 * Install dependencies.
 * @param config
 */
async function installDependencies (config: INewCommandConfig) {
	console.log(green(`Installing dependencies...`));

	// Check if the command is dry
	if (config.dry) {
		return;
	}

	// Run the command
	try {
		await run(`cd ${resolve(process.cwd(), config.dir)} && npm i @appnest/web-config -D`);
	} catch (err) {
		console.log(red(`Could not install dependencies: ${err.message}`));
	}
}

/**
 * Setup rollup.config.js
 * @param config
 */
function setupRollup (config: INewCommandConfig) {
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
	src_assets: resolve(__dirname, "${config.src}/${names.ASSETS}"),
	dist_assets: resolve(__dirname, "${config.dist}/${names.ASSETS}")
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
			copyConfig: {
				resources: [[folders.src_assets, folders.dist_assets]]
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

	writeFile(names.ROLLUP_CONFIG_JS, content, config);
}

/**
 * Setup tslint.json
 * @param config
 */
function setupTslint (config: INewCommandConfig) {
	const content = `{
  "extends": "./node_modules/@appnest/web-config/tslint.json"
}`;

	writeFile(names.TS_LINT_JSON, content, config);
}

/**
 * Setup tsconfig.json
 * @param config
 */
function setupTsconfig (config: INewCommandConfig) {
	const content = `{
  "extends": "./node_modules/@appnest/web-config/tsconfig.json"
}`;

	writeFile(names.TS_CONFIG_JSON, content, config);
}

/**
 * Setup .browserslistrc
 * @param config
 */
function setupBrowserslist (config: INewCommandConfig) {
	const content = `last 2 Chrome versions
last 2 Safari versions
last 2 Firefox versions`;

	writeFile(names.BROWSERSLISTRC, content, config);
}

// Step 6 - Setup karma.conf.js
function setupKarma (config: INewCommandConfig) {
	const content = `const {defaultResolvePlugins, defaultKarmaConfig} = require("@appnest/web-config");
 
module.exports = (config) => {
  config.set({
    ...defaultKarmaConfig({
      rollupPlugins: defaultResolvePlugins()
    }),
    basePath: "${config.src}",
    logLevel: config.LOG_INFO
  });
};`;

	writeFile(names.KARMA_CONFIG_JS, content, config);
}

/**
 * Add start and build scripts to package.json
 * @param config
 */
function setupScripts (config: INewCommandConfig) {
	const content = `{
	"scripts": {
		"b:dev": "rollup -c --environment NODE_ENV:dev",
		"b:prod": "rollup -c --environment NODE_ENV:prod",
		"s:dev": "rollup -c --watch --environment NODE_ENV:dev",
		"s:prod": "rollup -c --watch --environment NODE_ENV:prod",
		"s": "npm run s:dev"
	}
}`;

	writeFile(names.PACKAGE_JSON, content, config);
}

/**
 * Setup typings
 * @param config
 */
function setupTypings (config: INewCommandConfig) {
	const content = `/// <reference path="node_modules/@appnest/web-config/typings.d.ts" />`;
	writeFile(names.TYPINGS_D_TS, content, config);
}

/**
 * Setup gitignore
 * @param config
 */
function setupGitIgnore (config: INewCommandConfig) {
	const content = `# See http://help.github.com/ignore-files/ for more about ignoring files.

.DS_Store
ec2-user-key-pair.pem
/tmp
env.json
package-lock.json

# compiled output
/dist

# dependencies
/node_modules
/functions/node_modules

# IDEs and editors
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# IDE - VSCode
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# misc
/.sass-cache
/connect.lock
/coverage/*
/libpeerconnection.log
npm-debug.log
testem.log
logfile

# e2e
/e2e/*.js
/e2e/*.map

#System Files
.DS_Store
Thumbs.db
dump.rdb

/compiled/
/.idea/
/.cache/
/.rpt2_cache/
/.vscode/
*.log
/logs/
npm-debug.log*
/lib-cov/
/coverage/
/.nyc_output/
/.grunt/
*.7z
*.dmg
*.gz
*.iso
*.jar
*.rar
*.tar
*.zip
.tgz
.env
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
*.pem
*.p12
*.crt
*.csr
/node_modules/
/dist/
/documentation/`;

	writeFile(names.GITIGNORE, content, config);
}

/**
 * Setup base files.
 */
function setupBaseFiles (config: INewCommandConfig) {

	const mainScssContent = `html { font-size: 12px; }`;
	const mainTsContent = `document.addEventListener("click", () => alert("Hello World!"));`;
	const indexContent = `<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>@appnest/web-config</title>
</head>
<body>
	<p>Hello World!</p>
</body>
</html>`;

	mkdirpSync(join(resolve(process.cwd(), config.dir), join(config.src, names.ASSETS)));
	writeFile(join(config.src, names.MAIN_TS), mainTsContent, config);
	writeFile(join(config.src, names.MAIN_SCSS), mainScssContent, config);
	writeFile(join(config.src, names.INDEX_HTML), indexContent, config);
}

/**
 * Executes the new command.
 * @param dir
 */
export async function newCommand ({dir}: {dir: string}) {
	const config = await getNewCommandConfig({dir});
	setupRollup(config);
	setupTslint(config);
	setupTsconfig(config);
	setupBrowserslist(config);
	setupKarma(config);
	setupScripts(config);
	setupTypings(config);
	setupGitIgnore(config);
	setupBaseFiles(config);
	await installDependencies(config);
	console.log(green(`Finished creating project in "${resolve(process.cwd(), dir)}"`));
}
