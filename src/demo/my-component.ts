import { customElement, html, LitElement, property } from "lit-element";
import css from "./my-component.scss";

@customElement("my-component")
export class MyComponent extends LitElement {
	@property({type: String}) text!: string;

	render () {
		return html`
			<style>
				${css}
			</style>
			<p part="text">${this.text}</p>
			<wl-button @click="${() => alert("Hello World")}">Test</wl-button>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"my-component": MyComponent;
	}
}