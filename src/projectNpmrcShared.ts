import type { Logger } from "./shared/cli/logger.js";

export function makeFromRegistry({
	registry,
	logger,
}: {
	registry: string;
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
