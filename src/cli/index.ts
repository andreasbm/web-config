import * as program from "commander";
import pkg from "./../../package.json";
import { newCommand } from "./new";

program
	.version(pkg.version);

program
	.command("new")
	.description("Setup a new project from scratch.")
	.option('-d, --dir', `Base directory`, "")
	.action(options => {
		newCommand({
			dir: options.dir
		}).then();
	});

// Error on unknown commands
program.on("command:*", () => {
	console.error("Invalid command: %s\nSee --help for a list of available commands.");
	process.exit(1);
});

// Parse the input
program.parse(process.argv);

