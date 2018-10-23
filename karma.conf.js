const {defaultResolvePlugins, defaultKarmaConfig} = require("./dist/index.cjs.js");

module.exports = (config) => {
	config.set(defaultKarmaConfig({
		basePath: "src",
		logLevel: config.LOG_INFO,
		rollupPlugins: defaultResolvePlugins()
	}));
};
