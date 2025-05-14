import type { ParsedProjectNpmrc } from "./types.js";

import { fallbackLogger, type Logger } from "./shared/cli/logger.js";

/**
 * Construct a ParsedProjectNpmrc object using the provided parameters
 */
export function projectNpmrcMake({
	organization,
	project,
	feed,
	logger = fallbackLogger,
}: {
	organization: string;
	project?: string | undefined;
	feed: string;
	logger?: Logger;
}): ParsedProjectNpmrc {
	const urlWithoutRegistryAtEnd = project
		? `//pkgs.dev.azure.com/${organization}/${project}/_packaging/${feed}/npm/`
		: `//pkgs.dev.azure.com/${organization}/_packaging/${feed}/npm/`;

	const urlWithoutRegistryAtStart = project
		? `//pkgs.dev.azure.com/${organization}/${project}/_packaging/${feed}/npm/registry/`
		: `//pkgs.dev.azure.com/${organization}/_packaging/${feed}/npm/registry/`;

	// eg
	// organization: "johnnyreilly",
	// urlWithoutRegistryAtEnd: "//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/",
	// urlWithoutRegistryAtStart: "//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/",

	logger.info(`Made: 
- organization: ${organization}
- urlWithoutRegistryAtStart: ${urlWithoutRegistryAtStart}
- urlWithoutRegistryAtEnd: ${urlWithoutRegistryAtEnd}`);

	return {
		urlWithoutRegistryAtStart,
		urlWithoutRegistryAtEnd,
		organization,
		scope: undefined, // scope is not supported in this case (yet)
	};
}
