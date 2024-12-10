import type { ParsedProjectNpmrc } from "./types.js";

import { makeFromRegistry } from "./projectNpmrcShared.js";
import { fallbackLogger, type Logger } from "./shared/cli/logger.js";
import { readFileSafe } from "./shared/readFileSafe.js";

/**
 * Read the project .npmrc file to acquire necessary info
 */
export async function projectNpmrcParse({
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

	const regex = /^(?:@[\w-]+:)?registry=(.*)$/m;
	const match = regex.exec(npmrcContents);

	if (!match || match.length === 0) {
		throw new Error(`Unable to extract information from project .npmrc`);
	}

	const registry = match[1].trim();

	return makeFromRegistry({ registry, logger });
}
