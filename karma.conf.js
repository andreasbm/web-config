const {defaultResolvePlugins} = require("./dist/index.cjs.js");

module.exports = function (config) {
	const configuration = {
		basePath: "src",
		port: 9876,
		captureTimeout: 60000,
		concurrency: Infinity,
		logLevel: config.LOG_INFO,
		singleRun: true,
		colors: true,
		autoWatch: true,
		plugins: [
			"karma-mocha",
			"karma-chai",
			"karma-chrome-launcher",
			"karma-rollup-preprocessor"
		],
		browsers: ["ChromeHeadless"],
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
			plugins: [
				...defaultResolvePlugins(),
			],
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
	};

	config.set(configuration);
};
