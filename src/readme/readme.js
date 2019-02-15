import colors from "colors";
import fse from "fs-extra";
import argv from "minimist";
import path from "path";
import {CONFIG} from "./config.js";
import {generateReadme, getBadges, replace, writeFile} from "./helpers.js";
import {
	badgesTemplate,
	bulletsTemplate,
	descriptionTemplate,
	licenseTemplate,
	readmeTitleTemplate,
	sectionTemplate,
	logoTemplate
} from "./templates.js";

/**
 * Generators for the readme.
 * @type {*[]}
 */
const GENERATORS = [
	(pkg => {
		const logo = pkg.readme.logo;
		if (logo == null) {
			return null;
		}

		return logoTemplate(logo);
	}),
	(pkg => {
		const name = pkg.name;
		return readmeTitleTemplate(name);
	}),
	(pkg => {
		const badges = getBadges(pkg);
		if (badges.length === 0) {
			return null;
		}
		return badgesTemplate(badges, pkg);
	}),
	(pkg => {
		const description = pkg.description;
		const demo = pkg.readme.demo;
		const text = pkg.readme.text;
		return descriptionTemplate(description, text, demo);
	}),
	(pkg => {
		const bullets = pkg.readme.bullets || CONFIG.BULLETS;
		if (bullets.length === 0) {
			return null;
		}
		return bulletsTemplate(bullets);
	}),
	(pkg => {
		const sections = (pkg.readme.sections || CONFIG.SECTIONS).map(({content, title}) => {
			content = fse.readFileSync(path.resolve(content)).toString("utf8");
			return {content: replace(content, pkg), title: replace(title || "", pkg)};
		});

		return sections.map(sectionTemplate).join(`${CONFIG.LINE_BREAK}${CONFIG.LINE_BREAK}`);
	}),
	(pkg => {
		const license = pkg.license;
		const url = CONFIG.LICENSE_URL_MAP[license];
		if (url == null) {
			return null;
		}
		return licenseTemplate(license, url);
	})
];


// Extract the user arguments
const userArgs = argv(process.argv.slice(2));
const pkgName = path.resolve(userArgs["package"] || CONFIG.PKG_NAME);
const target = path.resolve(userArgs["target"] || CONFIG.TARGET);
const silent = userArgs["silent"] || CONFIG.SILENT;
const dry = userArgs["dry"] || CONFIG.DRY;

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