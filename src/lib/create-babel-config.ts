export const defaultBabelConfig = () => {
	return (api: any) => {
		api.cache(false);
		const presets = [
			[
				"@babel/preset-env",
				{
					useBuiltIns: false,
					modules: false
				}
			]
		];

		const plugins = [
			//"@babel/plugin-transform-typescript",
			"@babel/plugin-syntax-dynamic-import",
			"@babel/plugin-proposal-export-default-from",
			"@babel/plugin-proposal-export-namespace-from",
			"@babel/plugin-proposal-class-properties",
			"@babel/plugin-external-helpers",
			"@babel/plugin-proposal-object-rest-spread",
			"@babel/plugin-proposal-optional-chaining",
			[
				"@babel/plugin-transform-runtime",
				{
					corejs: 2,
					helpers: true,
					regenerator: false
				}
			]
		];

		return {
			presets,
			plugins
		};
	};
};
