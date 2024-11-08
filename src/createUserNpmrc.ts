import type { Logger } from "./logger.js";
import type { ParsedProjectNpmrc } from "./parseProjectNpmrc.js";

/**
 * Make a user .npmrc file that looks a little like this:
 *
 * ; begin auth token
 * //pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/:username=johnnyreilly
 * //pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/:_password=[BASE64_ENCODED_PERSONAL_ACCESS_TOKEN]
 * //pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/:email=npm requires email to be set but doesn't use the value
 * //pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/:username=johnnyreilly
 * //pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/:_password=[BASE64_ENCODED_PERSONAL_ACCESS_TOKEN]
 * //pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/:email=npm requires email to be set but doesn't use the value
 * ; end auth token
 */
export function createUserNpmrc({
	email = "npm requires email to be set but doesn't use the value",
	parsedProjectNpmrc,
	pat,
	// logger = fallbackLogger,
}: {
	email?: string | undefined;
	parsedProjectNpmrc: ParsedProjectNpmrc;
	logger?: Logger;
	pat: string;
}): string | undefined {
	const base64EncodedPAT = Buffer.from(pat).toString("base64");

	const { urlWithoutRegistryAtEnd, urlWithoutRegistryAtStart, organisation } =
		parsedProjectNpmrc;

	const npmrc = `; begin auth token
${urlWithoutRegistryAtStart}:username=${organisation}
${urlWithoutRegistryAtStart}:_password=${base64EncodedPAT}
${urlWithoutRegistryAtStart}:email=${email}
${urlWithoutRegistryAtEnd}:username=${organisation}
${urlWithoutRegistryAtEnd}:_password=${base64EncodedPAT}
${urlWithoutRegistryAtEnd}:email=${email}
; end auth token
`;

	return npmrc;
}