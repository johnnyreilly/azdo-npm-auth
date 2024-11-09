import path from "node:path";

import { fallbackLogger, type Logger } from "./logger.js";
import { readFileSafe } from "./shared/readFileSafe.js";

export interface ParsedProjectNpmrc {
	organisation: string;
	urlWithoutRegistryAtEnd: string;
	urlWithoutRegistryAtStart: string;
}

/**
 * Read the project .npmrc file to acquire necessary info
 */
export async function parseProjectNpmrc({
	config,
	logger = fallbackLogger,
}: {
	config?: string | undefined;
	logger?: Logger;
}): Promise<ParsedProjectNpmrc> {
	const npmrcPath = config
		? path.resolve(config)
		: path.resolve(process.cwd(), ".npmrc");

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

	return { urlWithoutRegistryAtStart, urlWithoutRegistryAtEnd, organisation };
}
