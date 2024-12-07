import type { ParsedProjectNpmrc } from "./types.js";

import { fallbackLogger, type Logger } from "./shared/cli/logger.js";
import { readFileSafe } from "./shared/readFileSafe.js";

/**
 * Read the project .npmrc file to acquire necessary info
 */
export async function parseProjectNpmrc({
	npmrcPath,
	logger = fallbackLogger,
}: {
	npmrcPath: string;
	logger?: Logger;
}): Promise<ParsedProjectNpmrc> {
	logger.info(`Loading .npmrc at: ${npmrcPath}`);

	const npmrcContents = await readFileSafe(npmrcPath, "");

	if (!npmrcContents) {
		throw new Error(`No .npmrc found at: ${npmrcPath}`);
	}

	const regex = /^registry=.*$/gm;
	const match = npmrcContents.match(regex);

	if (!match || match.length === 0) {
		throw new Error(`Unable to extract information from project .npmrc`);
	}

	const urlWithoutRegistryAtStart = match[0]
		.replace("registry=https:", "")
		.trim();
	const urlWithoutRegistryAtEnd = urlWithoutRegistryAtStart.replace(
		/registry\/$/,
		"",
	);
	// extract the organisation which we will use as the username
	// not sure why this is the case, but this is the behaviour
	// defined in ADO
	const organisation = urlWithoutRegistryAtEnd.split("/")[3];

	logger.info(`Parsed: 
- organisation: ${organisation}
- urlWithoutRegistryAtStart: ${urlWithoutRegistryAtStart}
- urlWithoutRegistryAtEnd: ${urlWithoutRegistryAtEnd}`);

	return {
		urlWithoutRegistryAtStart,
		urlWithoutRegistryAtEnd,
		organization: organisation,
	};
}
