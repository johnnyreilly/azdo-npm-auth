import type { Logger } from "./shared/cli/logger.js";

export function makeFromRegistry({
	registry,
	scope,
	logger,
}: {
	registry: string;
	scope?: string;
	logger: Logger;
}) {
	if (!registry.startsWith("https:")) {
		throw new Error("Unable to extract information");
	}
	const urlWithoutRegistryAtStart = registry.replace("https:", "");
	const urlWithoutRegistryAtEnd = urlWithoutRegistryAtStart.replace(
		/registry\/$/,
		"",
	);
	// extract the organisation which we will use as the username
	// not sure why this is the case, but this is the behaviour
	// defined in ADO
	const organization = urlWithoutRegistryAtEnd.split("/")[3];

	logger.info(`Parsed:
- scope: ${scope ?? ""}
- organisation: ${organization}
- urlWithoutRegistryAtStart: ${urlWithoutRegistryAtStart}
- urlWithoutRegistryAtEnd: ${urlWithoutRegistryAtEnd}`);

	return {
		urlWithoutRegistryAtStart,
		urlWithoutRegistryAtEnd,
		organization,
	};
}
