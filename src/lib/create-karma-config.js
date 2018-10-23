/**
 * Creates a default karma configuration.
 * @param basePath
 * @param logLevel
 * @param port
 * @param singleRun
 * @param browsers
 * @param karmaPlugins
 * @param rollupPlugins
 */
export const defaultKarmaConfig = ({basePath, logLevel, port, singleRun, browsers, karmaPlugins, rollupPlugins} = {}) => {
	return {
		basePath: basePath || "",
		port: port || 9876,
		captureTimeout: 60000,
		concurrency: Infinity,
		logLevel: logLevel,
		singleRun: singleRun || true,
		colors: true,
		autoWatch: true,
		plugins: [
			"karma-mocha",
			"karma-chai",
			"karma-chrome-launcher",
			"karma-rollup-preprocessor",
			...(karmaPlugins || [])
		],
		browsers: browsers || ["ChromeHeadless"],
		frameworks: ["mocha", "chai"],
		reporters: ["progress"],
		files: [
			/**
			 * Make sure to disable Karma’s file watcher
			 * because the preprocessor will use its own.
			 */
			{pattern: "**/*.test.{ts,js}", watched: false}
		],
		preprocessors: {
			"**/*.test.{ts,js}": ["rollup"]
		},
		rollupPreprocessor: {
			/**
			 * This is just a normal Rollup config object,
			 * except that `input` is handled for you.
			 */
			plugins: rollupPlugins,
			output: {
				format: "iife",
				name: "wutwut",
				sourcemap: "inline"
			}
		},
		// The below line tricks karma into thinking .ts files are cool
		// See https://github.com/webpack-contrib/karma-webpack/issues/298#issuecomment-367081075 for more info
		mime: {
			"text/x-typescript":  ["ts"]
		}
	}
};
