import type { ParsedProjectNpmrc } from "./types.js";

import { makeParsedProjectNpmrcFromRegistry } from "./projectNpmrcShared.js";
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
}): Promise<ParsedProjectNpmrc[]> {
	logger.info(`Loading .npmrc at: ${npmrcPath}`);

	const npmrcContents = await readFileSafe(npmrcPath, "");

	if (!npmrcContents) {
		throw new Error(`No .npmrc found at: ${npmrcPath}`);
	}

	const matches = parseNpmrcContent(npmrcContents);

	return matches.map(({ registry, scope, fullRegistryMatch }) =>
		makeParsedProjectNpmrcFromRegistry({
			registry,
			scope,
			logger,
			fullRegistryMatch,
		}),
	);
}

export interface MatchedRegistry {
	fullRegistryMatch: string;
	registry: string;
	scope: string | undefined;
}

export function parseNpmrcContent(npmrcContents: string): MatchedRegistry[] {
	const regex = /^(?<scope>@[\w-]+:)?registry=(?<registry>.*)$/gm;

	const matches: MatchedRegistry[] = [];
	let match: null | RegExpExecArray = null;
	while ((match = regex.exec(npmrcContents)) !== null) {
		if (!match.groups?.registry) {
			throw new Error(`Unable to extract registry from project .npmrc`);
		}

		const registry = match.groups.registry.trim();

		const scope = match.groups.scope;

		matches.push({
			fullRegistryMatch: match[0],
			registry,
			scope: scope ? scope.substring(0, scope.length - 1) : undefined,
		});
	}

	if (matches.length === 0) {
		throw new Error(`Unable to extract information from project .npmrc`);
	}

	return matches;
}
