import "./my-component";
import "./main.scss";
import { env } from "./env";
import pkg from "./../../package.json";

console.log(pkg.name, env.TAG);

const {left, top} = {left: 123, top: 123};
console.log(left, top);

// console.log([...[1,2,3], ...[4,5,6]]);
//
// const rnd = Math.random();
// if (rnd > 0.5) {
// 	import("./my-component").then(m => {
// 		console.log(m);
// 	});
// }