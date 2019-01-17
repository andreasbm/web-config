import { customElement, html, LitElement } from "lit-element";
import css from "./my-component.scss";

@customElement("my-component")
export class MyComponent extends LitElement {
	render () {
		return html`
			<style>
				${css}
			</style>
			<p>It workz</p>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"my-component": MyComponent;
	}
}