import "./my.component";

// Inject global styles
import css from "./main.scss";
const $styles = document.createElement("style");
$styles.innerHTML = css;
$styles.type = 'text/css';
document.head.appendChild($styles);