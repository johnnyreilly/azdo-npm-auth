import { AzureCliCredential } from "@azure/identity";
import chalk from "chalk";
import { fromZodError } from "zod-validation-error";

import type { TokenResult } from "./types.js";

import { fallbackLogger, type Logger } from "./logger.js";
import { tokenResultSchema } from "./schemas.js";

export async function createPat({
	logger = fallbackLogger,
	organisation,
}: {
	logger?: Logger;
	organisation: string;
}): Promise<TokenResult | undefined> {
	// const credential = new InteractiveBrowserCredential({});
	const credential = new AzureCliCredential();

	// get a token that can be used to authenticate to Azure DevOps
	// taken from https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/manage-personal-access-tokens-via-api?view=azure-devops#configure-a-quickstart-application
	// 'Update the SCOPE configuration variable to "499b84ac-1321-427f-aa17-267ca6975798/.default" to refer to the Azure DevOps resource and all of its scopes.'
	const token = await credential.getToken([
		"499b84ac-1321-427f-aa17-267ca6975798",
	]);

	// Get the current date
	const currentDate = new Date();

	// Add 30 days to the current date
	const futureDate = new Date(currentDate);
	futureDate.setDate(currentDate.getDate() + 30);

	try {
		// https://learn.microsoft.com/en-us/rest/api/azure/devops/tokens/pats/create?view=azure-devops-rest-7.1&tabs=HTTP
		const url = `https://vssps.dev.azure.com/${organisation}/_apis/tokens/pats?api-version=7.1-preview.1`;
		const data = {
			displayName: `made by ado-npm-auth-lite at: ${new Date().toISOString()}`,
			scope: "vso.packaging",
			validTo: futureDate.toISOString(),
			allOrgs: false,
		};

		const response = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token.token}`,
				"X-TFS-FedAuthRedirect": "Suppress",
				"X-VSS-ForceMsaPassThrough": "True",
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			logger.error(`HTTP error! status: ${response.status.toString()}`);
			return;
		}

		const tokenParseResult = tokenResultSchema.safeParse(await response.json());

		if (!tokenParseResult.success) {
			logger.error(
				chalk.red(
					fromZodError(tokenParseResult.error, {
						issueSeparator: "\n    - ",
					}),
				),
			);
		}

		logger.info(`Created Personal Access Token`);

		return tokenParseResult.data;
	} catch (error) {
		logger.error(
			`Error creating Personal Access Token: ${error instanceof Error ? error.message : ""}`,
		);
	}
}
