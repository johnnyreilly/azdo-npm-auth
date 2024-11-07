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
}): Promise<ParsedProjectNpmrc | undefined> {
	const npmrcPath = config
		? path.resolve(config)
		: path.resolve(process.cwd(), ".npmrc");

	logger.info(`Loading .npmrc at: ${npmrcPath}`);

	const npmrcContents = await readFileSafe(npmrcPath, "");

	if (!npmrcContents) {
		logger.error(`No .npmrc found at: ${npmrcPath}`);
		return;
	}

	const regex = /^registry=.*$/gm;
	const match = npmrcContents.match(regex);

	if (!match || match.length === 0) {
		logger.error(`Unable to extract information from project .npmrc`);
		return;
	}

	const urlWithoutRegistryAtStart = match[0]
		.replace("registry=https:", "")
		.trim();
	const urlWithoutRegistryAtEnd = urlWithoutRegistryAtStart.replace(
		/\/registry\/$/,
		"",
	);
	// extract the organisation which we will use as the username
	// not sure why this is the case, but this is the behaviour
	// defined in ADO
	const organisation = urlWithoutRegistryAtEnd.split("/")[3];

	return { urlWithoutRegistryAtStart, urlWithoutRegistryAtEnd, organisation };
}
