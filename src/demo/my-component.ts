import { customElement, html, LitElement } from "@polymer/lit-element";
import css from "./my-component.scss";

@customElement("my-component" as any)
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