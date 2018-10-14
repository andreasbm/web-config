import MagicString from "magic-string";
import postcss from "postcss";
import path from "path";
import { createFilter } from 'rollup-pluginutils';

const defaultConfig = {
	include: [],
	exclude: []
};

function processFile ({code, id}) {
	return new Promise(res => {
		res();
	});
}

export default function litHTML (config) {
	const {include, exclude} = {...defaultConfig, ...config};

	// Generate a filter that determines whether the file should be handled by the plugin or not.
	const filter = createFilter(include, exclude);

	return {
		name: 'litHTML',
		resolveId: (id, importer) => {
			if (!importer || !filter(id)) return;
			return path.resolve(path.dirname(importer), id);
		},
		transform: (code, id) => {
			if (!filter(id)) return;

			if (id.endsWith("my.component.ts")) {
				console.log("WUHUU", id, code);
			}
		}
	}
};