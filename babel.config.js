module.exports = () => {
	const presets = [
		[
			"@babel/preset-env",
			{
				useBuiltIns: false,
				modules: false,
				forceAllTransforms: true
			}
		]
	];

	const plugins = [
		"@babel/plugin-syntax-dynamic-import",
		"@babel/plugin-proposal-export-default-from",
		"@babel/plugin-proposal-export-namespace-from",
		"@babel/plugin-proposal-class-properties",
		"@babel/plugin-proposal-object-rest-spread",
		["@babel/plugin-transform-runtime", {
			corejs: 2,
			helpers: true,
			regenerator: false,
			useESModules: false
		}]
	];

	return {
		presets,
		plugins
	};
};