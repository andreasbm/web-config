import colors from "colors";
import { generate } from "escodegen";
import { parseModule, ParseOptions, parseScript, Program } from "esprima";
import { replace as estraverseReplace, VisitorOption } from "estraverse";
import * as ESTree from "estree";
import { minify } from "html-minifier";
import { resolve, dirname } from "path";
import { ResolveIdResult, SourceDescription } from "rollup";
import { createFilter } from "@rollup/pluginutils";
import { emptySourcemap } from "../util";

export type HtmlMinifierConfig = any;

export interface IRollupPluginMinifyLitHtml {
	include: (string | RegExp)[] | string | RegExp | null;
	exclude: (string | RegExp)[] | string | RegExp | null;
	verbose: boolean;
	esprima: ParseOptions;
	htmlMinifier: HtmlMinifierConfig;
}

/**
 * #########################################
 * Parts of this code is heavily inspired by https://github.com/edge0701/minify-lit-html-loader.
 * The license has therefore been included.
 * #########################################
 */

/**
 * The default configuration for the minify-lit-html plugin.
 */
const defaultConfig: IRollupPluginMinifyLitHtml = {
	include: [/\.js$/, /\.ts$/],
	exclude: [],
	verbose: true,
	esprima: {
		loc: true,
		range: true,
		tolerant: true,
		tokens: false
	},
	htmlMinifier: {
		caseSensitive: true,
		minifyCSS: false /* Should be set as true, but the HTML minifier won't allow the <style>${css}</style> syntax, so I disabled it */,
		preventAttributesEscaping: true,
		preserveLineBreaks: false,
		collapseWhitespace: true,
		conservativeCollapse: true,
		removeComments: true,
		ignoreCustomFragments: [
			/<\s/,
			/<=/,
			/\$\{/,
			/\}/,
			/* The HTML minifier won't parse parts with double quote inside (eg. @click="${() => alert("Hello World")}") */
			/"\${[^}]+"[^}]+}"/
		]
	}
};

/**
 * Creates a transformer that traverses an ast, minifying the html`...` parts from lit-html.
 * This function is heavily inspired by https://github.com/edge0701/minify-lit-html-loader/blob/master/src/index.ts.
 * @param code
 * @param config
 */
function createTransformer({ code, config }: { code: string; config: HtmlMinifierConfig }) {
	const chunks = code.split("");
	return (ast: any) => {
		return estraverseReplace(ast, {
			enter: (node: ESTree.Node): VisitorOption | ESTree.Node | void => {
				// If the node type is a TaggedTemplateExpression we know we are looking at a TemplateResult.
				if (node.type === "TaggedTemplateExpression") {
					// If the tag name or property name is html we know we are looking at a html`...` part.
					if (
						(node.tag.type === "Identifier" && node.tag.name === "html") ||
						(node.tag.type === "MemberExpression" && node.tag.property.type === "Identifier" && node.tag.property.name === "html")
					) {
						// Minify the HTML inside the html tagged template literals.
						const mini = minify(chunks.slice(node.quasi.range![0] + 1, node.quasi.range![1] - 1).join(""), config.htmlMinifier);

						// Return the new node
						return <any>{
							...node,
							quasi: {
								...node.quasi,
								quasis: [
									{
										type: "TemplateElement",
										value: {
											raw: mini
										},
										range: [node.quasi.range![0], mini.length]
									}
								]
							}
						};
					}
				}
			},
			fallback: "iteration"
		});
	};
}

/**
 * Figures out whether the code is a script type or module type.
 * @param code
 * @param config
 */
function parseAst({ code, config }: { code: string; config: IRollupPluginMinifyLitHtml }): Program {
	try {
		return parseModule(code, config.esprima);
	} catch (e) {
		return parseScript(code, config.esprima);
	}
}

/**
 * Processes the code by minifying the html using in the tagged template literals.
 * @param code
 * @param id
 * @param config
 * @returns {Promise<void>}
 */
function processFile({ code, id, config }: { code: string; id: string; config: IRollupPluginMinifyLitHtml }): Promise<SourceDescription> {
	return new Promise(res => {
		try {
			// Create transformer that traverses the ast and minifies the html`...` parts.
			const transform = createTransformer({ code, config });

			// Build an ast from the current config
			const ast = parseAst({ code, config });

			// // Create new ast using the transformer
			const newAst = transform(ast);

			// Regenerate the code based on the new ast.
			// If sourceMapWithCode is truthy, an object is returned from
			// generate() of the form: { code: .. , map: .. }
			const { code: minifiedCode, map } = <any>generate(newAst, {
				sourceMapWithCode: true,
				sourceMap: id,
				sourceContent: code,
				sourceCode: code
			});

			return res({
				code: minifiedCode,
				map: map.toString()
			} as SourceDescription);
		} catch (err) {
			if (config.verbose) {
				console.log(colors.yellow(`[minifyLitHTML] - Could not parse "${err.message}" in "${id}"\n`));
			}

			// Sometimes we cannot parse the file. This should however not stop the build from finishing.
			res({
				code,
				map: emptySourcemap
			} as SourceDescription);
		}
	});
}

/**
 * A Rollup plugin that minifies lit-html templates.
 * @param config
 * @returns {{name: string, resolveId: (function(*=, *=): *), transform: (function(*, *=): Promise<void>)}}
 */
export function minifyLitHTML(config: Partial<IRollupPluginMinifyLitHtml> = {}) {
	config = { ...defaultConfig, ...config };
	const { include, exclude } = config;

	// Generate a filter that determines whether the file should be handled by the plugin or not.
	const filter = createFilter(include, exclude);

	return {
		name: "minifyLitHTML",
		resolveId: (id: string, importer: string): ResolveIdResult => {
			if (!importer || !filter(id)) return;
			return resolve(dirname(importer), id);
		},
		transform: (code: string, id: string): void | Promise<SourceDescription | string | void> => {
			if (!filter(id)) return;
			return processFile({ code, id, config: config as IRollupPluginMinifyLitHtml });
		}
	};
}
