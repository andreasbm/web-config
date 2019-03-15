const {defaultResolvePlugins, defaultKarmaConfig} = require("./dist/lib/index.cjs.js");

module.exports = (config) => {
	config.set({
		...defaultKarmaConfig({
			rollupPlugins: defaultResolvePlugins()
		}),
		basePath: "src",
		logLevel: config.LOG_INFO
	});
};
