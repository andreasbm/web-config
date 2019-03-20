import ts from "@wessberg/rollup-plugin-ts";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import json from "rollup-plugin-json";
import pkg from "./package.json";

const distPath = "dist/lib";
const srcPath = "src";

const config = {
	plugins: [
		resolve({
			module: true,
			browser: true,
			jsnext: true,
			main: false,
			modulesOnly: false
		}),
		json(),
		ts({
			transpiler: "babel",
			tsconfig: "tsconfig-lib.json"
		}),
		commonjs({
			include: "**/node_modules/**"
		})
	],
	external: [
		...Object.keys(pkg.dependencies || {}),
		...Object.keys(pkg.devDependencies || {}),
		"child_process"
	],
	treeshake: false
};

export default [
	{
		...config,
		input: `${srcPath}/lib/index.ts`,
		output: [
			{
				file: `${distPath}/index.cjs.js`,
				format: "cjs"
			},
			{
				file: `${distPath}/index.esm.js`,
				format: "esm"
			}
		]
	}
];