import * as fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { fallbackLogger, type Logger } from "./shared/cli/logger.js";

export async function writeNpmrc({
	npmrc,
	logger = fallbackLogger,
}: {
	npmrc: string;
	logger?: Logger;
}): Promise<void> {
	// Get the home directory
	const homeDirectory = os.homedir();

	// Define the path for the .npmrc file
	const userNpmrcPath = path.join(homeDirectory, ".npmrc");

	logger.info(`Writing users .npmrc to: ${userNpmrcPath}`);

	try {
		// Write the content to the .npmrc file
		// fs.appendFile will create the file if it doesn't exist
		await fs.appendFile(userNpmrcPath, npmrc, "utf8");
		logger.info("Successfully wrote .npmrc file");
	} catch (error) {
		const errorMessage = `Error writing users .npmrc to ${userNpmrcPath}: ${error instanceof Error ? error.message : ""}`;
		throw new Error(errorMessage);
	}
}
