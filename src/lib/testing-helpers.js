/**
 * Waits for an element to be defined.
 * @param elementName
 * @returns {PromiseLike<void>}
 */
export function waitForElement (elementName) {
	return window.customElements.whenDefined(elementName);
}

/**
 * Waits for multiple elements to be defined.
 * @param elementNames
 * @returns {Promise<[any , any , any , any , any , any , any , any , any , any]>}
 */
export function waitForElements (elementNames) {
	const promises = elementNames.map(waitForElement);
	return Promise.all(promises);
}

/**
 * Creates a container.
 * @returns {HTMLElement}
 */
export function createContainer () {
	const container = document.createElement("div");
	document.body.appendChild(container);
	return container;
}

/**
 * Removes a container.
 * @param container
 */
export function removeContainer (container) {
	container.remove();
	container = null;
}

/**
 * Waits X ms.
 * @param ms
 * @returns {Promise<any>}
 */
export function wait (ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

/**
 * Averages an array of numbers.
 * @param arr
 * @returns {number}
 */
export function average (arr) {
	return arr.reduce((p, c) => p + c, 0) / arr.length;
}