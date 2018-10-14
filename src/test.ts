const wut = Math.random();
if (wut > 0.5) {
	import("./my-other-file.js").then(m => {
		console.log(m);
	});
}