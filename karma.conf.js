const {defaultResolvePlugins, defaultKarmaConfig} = require("./dist/index.cjs.js");

module.exports = (config) => {
	config.set({
		...defaultKarmaConfig({
			rollupPlugins: defaultResolvePlugins()
		}),
		basePath: "src",
		logLevel: config.LOG_INFO
	});
};
