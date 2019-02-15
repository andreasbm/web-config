import colors from "colors";
import argv from "minimist";
import fse from "fs-extra";
import path from "path";
import {DEFAULTS, LINE_BREAK} from "./config.js";
import {generateReadme, getBadges, writeFile, replace} from "./helpers.js";
import {
	badgesTemplate,
	bulletsTemplate,
	descriptionTemplate,
	licenseTemplate,
	readmeTitleTemplate,
	sectionTemplate
} from "./templates.js";

/**
 * Generators for the readme.
 * @type {*[]}
 */
const GENERATORS = [
	(pkg => {
		const name = pkg.name;
		return readmeTitleTemplate(name);
	}),
	(pkg => {
		const badges = getBadges(pkg);
		return badgesTemplate(badges, pkg);
	}),
	(pkg => {
		const description = pkg.description;
		const demo = pkg.readme.demo;
		const text = pkg.readme.text;
		return descriptionTemplate(description, text, demo);
	}),
	(pkg => {
		const bullets = pkg.readme.bullets || DEFAULTS.BULLETS;
		return bulletsTemplate(bullets);
	}),
	(pkg => {
		const sections = (pkg.readme.sections || DEFAULTS.SECTIONS).map(({content, title}) => {
			content = fse.readFileSync(path.resolve(content)).toString("utf8");
			return {content: replace(content, pkg), title: replace(title, pkg)};
		});

		return sections.map(sectionTemplate).join(`${LINE_BREAK}${LINE_BREAK}`);
	}),
	(pkg => {
		const license = pkg.license;
		return licenseTemplate(license, DEFAULTS.LICENSE_URL_MAP);
	})
];


// Extract the user arguments
const userArgs = argv(process.argv.slice(2));
const pkgName = path.resolve(userArgs["package"] || DEFAULTS.PKG_NAME);
const target = path.resolve(userArgs["target"] || DEFAULTS.TARGET);
const silent = userArgs["silent"] || DEFAULTS.SILENT;
const dry = userArgs["dry"] || DEFAULTS.DRY;

// Generate readme
const readme = generateReadme(pkgName, GENERATORS);

// Write the file
if (!dry) {
	writeFile(target, readme);

	// Print the success messsage if not silent
	if (!silent) {
		console.log(colors.green(`[readme] - Readme was successfully generated at "${target}".`));
	}
} else {
	console.log(colors.green(`[readme] - Created the following readme but did not write it to any files".`), colors.green(readme));
}