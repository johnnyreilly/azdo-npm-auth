import type { Logger } from "./shared/cli/logger.js";
import type { ParsedProjectNpmrc } from "./types.js";

export function makeParsedProjectNpmrcFromRegistry({
	registry,
	scope,
	logger,
}: {
	/** eg https://pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/ */
	registry: string;
	/** eg @myorg */
	scope?: string;
	logger: Logger;
}): ParsedProjectNpmrc {
	if (!registry.startsWith("https:")) {
		throw new Error("Unable to extract information");
	}
	const urlWithoutRegistryAtStart = registry.replace("https:", "");
	const urlWithoutRegistryAtEnd = urlWithoutRegistryAtStart.replace(
		/registry\/$/,
		"",
	);
	// extract the organization which we will use as the username
	// not sure why this is the case, but this is the behaviour
	// defined in ADO
	const organization = urlWithoutRegistryAtEnd.split("/")[3];

	logger.info(`Parsed:
- scope: ${scope ?? ""}
- organization: ${organization}
- urlWithoutRegistryAtStart: ${urlWithoutRegistryAtStart}
- urlWithoutRegistryAtEnd: ${urlWithoutRegistryAtEnd}`);

	return {
		urlWithoutRegistryAtStart,
		urlWithoutRegistryAtEnd,
		organization,
		scope,
	};
}
