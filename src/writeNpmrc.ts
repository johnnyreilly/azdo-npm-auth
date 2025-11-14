import * as fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { fallbackLogger, type Logger } from "./shared/cli/logger.js";

export function appendAuthBlockContent({
	npmrc,
	existingContent = "",
	logger = fallbackLogger,
}: {
	npmrc: string;
	existingContent?: string;
	logger?: Logger;
}): string {
	// find our auth token block in the existing content
	const authTokenPattern = /; begin auth token\n[\s\S]*?\n; end auth token\n?/;

	let newContent: string;
	if (existingContent && authTokenPattern.test(existingContent)) {
		logger.info("Found existing auth token block(s), replacing all of them");
		// using global flag to find all blocks and replace them with a single new block
		const replacePattern = /; begin auth token\n[\s\S]*?\n; end auth token\n?/g;
		let replacedFirst = false;
		newContent = existingContent.replace(replacePattern, () => {
			if (!replacedFirst) {
				replacedFirst = true;
				return npmrc;
			}
			// empty string for subsequent matches to remove duplicates
			return "";
		});
	} else {
		if (existingContent) {
			logger.info(
				"No existing auth token block found, appending to existing content",
			);

			const separator = existingContent.endsWith("\n") ? "" : "\n";
			newContent = existingContent + separator + npmrc;
		} else {
			newContent = npmrc;
		}
	}

	return newContent;
}

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
		let existingContent = "";
		try {
			existingContent = await fs.readFile(userNpmrcPath, "utf8");
		} catch (error) {
			// gracefully fail, file will be created later
			if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
				throw error;
			}
		}

		const newContent = appendAuthBlockContent({
			npmrc,
			existingContent,
			logger,
		});

		// Write the updated content to the .npmrc file
		await fs.writeFile(userNpmrcPath, newContent, "utf8");
		logger.info("Successfully wrote .npmrc file");
	} catch (error) {
		const errorMessage = `Error writing users .npmrc to ${userNpmrcPath}: ${error instanceof Error ? error.message : ""}`;
		throw new Error(errorMessage);
	}
}
