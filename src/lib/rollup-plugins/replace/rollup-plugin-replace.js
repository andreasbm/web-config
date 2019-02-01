import path from "path";
import colors from "colors";

const defaultConfig = {
	verbose: true,
	resources: []
};

/**
 * A Rollup plugin that replaces an import with another import.
 * @param config
 * @returns {{name: string, resolveId: resolveId}}
 */
export function replace (config) {
	const {resources, verbose} = {...defaultConfig, ...config};

	return {
		name: "replace",
		resolveId: (id, importer) => {
			if (!importer) return;

			const {name: idName} = path.parse(id);
			for (const [from, to] of resources) {
				if (from == null || to == null) return;
				const {name: fromName} = path.parse(from);

				// If the id and the from name are the same, we simply need to resolve
				// it to the "to name" instead and we have replaced the file.
				if (idName === fromName) {
					if (verbose) {
						console.log(colors.green(`[replace] - Replaced "${id}" with "${to}"\n`));
					}

					return path.resolve(to);
				}
			}
		}
	};
}

