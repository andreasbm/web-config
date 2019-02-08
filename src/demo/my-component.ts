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
			<p part="text" @click="${() => alert("Hello World")}">${this.text}</p>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"my-component": MyComponent;
	}
}