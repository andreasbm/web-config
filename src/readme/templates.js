import {replace} from "./helpers.js";
import {LINE_BREAK} from "./config";

/**
 * Generates the template for the title.
 * @param title
 * @returns {string}
 */
export function readmeTitleTemplate (title) {
	return `<h1 align="center">${title}</h1>`
}

/**
 * Generates a line template.
 * @returns {string}
 */
export function lineTemplate () {
	return `![split](https://github.com/andreasbm/web-config/raw/master/split.png)`;
}

/**
 * Generates a template for the title.
 * @param title
 * @param level
 * @returns {string}
 */
export function titleTemplate (title, level) {
	const beforeTitle = level <= 2 ? `${lineTemplate()}${LINE_BREAK}${LINE_BREAK}` : "";
	const beforeContent = level <= 2 ? ` ❯ ` : " ";
	return `${beforeTitle}${Array(level).fill("#").join("")}${beforeContent}${title}`
}

/**
 * Generates a template for the badges.
 * @param badges
 * @returns {string}
 */
export function badgesTemplate (badges, pkg) {
	return `<p align="center">
		${badges.map(badge => replace(`<a href="${badge.url}"><img alt="${badge.name}" src="${badge.img}" height="20"></img></a>`, pkg))}
	</p>
	`;
}

/**
 * Generates a template for the license.
 * @param license
 * @param licensUrlsMap
 * @returns {string}
 */
export function licenseTemplate (license, licensUrlsMap) {
	return `${titleTemplate("License", 2)}
	
Licensed under [${license}](${licensUrlsMap[license]}).`;
}

/**
 * Generates a template for the demo link.
 * @param url
 * @returns {string}
 */
export function demoTemplate (url) {
	return `Go here to see a demo <a href="${url}">${url}</a>.`;
}

/**
 * Generates a description template.
 * @param description
 * @param text
 * @param demo
 * @returns {string}
 */
export function descriptionTemplate (description, text, demo) {
	return `<p align="center">
  <b>${description}</b></br>
  <sub>${text != null ? text : ""}${demo != null ? ` ${demoTemplate(demo)}` : ""}<sub>
</p>

<br />`;
}

/**
 * Generates a bullets template.
 * @param bullets
 */
export function bulletsTemplate (bullets) {
	return bullets.map(bullet => `* ${bullet}`).join(LINE_BREAK);
}

/**
 * Generates a section template.
 * @param section
 */
export function sectionTemplate ({title, content}) {
	return `${titleTemplate(title, 2)}

${content}`;
}