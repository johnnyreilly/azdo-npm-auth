import { AzureCliCredential } from "@azure/identity";
import { execa, ExecaError } from "execa";
import { fromZodError } from "zod-validation-error";

import type { TokenResult } from "./types.js";

import { tokenResultSchema } from "./schemas.js";
import { fallbackLogger, type Logger } from "./shared/cli/logger.js";

export async function createPat({
	logger = fallbackLogger,
	organization,
	daysToExpiry,
	scope = "vso.packaging",
}: {
	logger?: Logger;
	organization: string;
	daysToExpiry?: number;
	scope?: string;
}): Promise<TokenResult> {
	// const credential = new InteractiveBrowserCredential({});
	logger.info(`Creating Azure CLI Token`);

	const credential = new AzureCliCredential();

	// get a token that can be used to authenticate to Azure DevOps
	// taken from https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/manage-personal-access-tokens-via-api?view=azure-devops#configure-a-quickstart-application
	// 'Update the SCOPE configuration variable to "499b84ac-1321-427f-aa17-267ca6975798/.default" to refer to the Azure DevOps resource and all of its scopes.'
	const token = await credential.getToken([
		"499b84ac-1321-427f-aa17-267ca6975798",
	]);

	logger.info(`Created Azure CLI Token`);
	logger.info();

	// Get the current date
	const validTo = computeTokenExpiry(daysToExpiry);

	try {
		// https://learn.microsoft.com/en-us/rest/api/azure/devops/tokens/pats/create?view=azure-devops-rest-7.1&tabs=HTTP
		const url = `https://vssps.dev.azure.com/${organization}/_apis/tokens/pats?api-version=7.1-preview.1`;
		const data = {
			displayName: `made by azdo-npm-auth at: ${new Date().toISOString()}`,
			scope,
			allOrgs: false,
			...(validTo && { validTo: validTo.toISOString() }),
		};

		let responseText = "";
		try {
			responseText = await createPATWithApi({
				logger,
				data,
				url,
				token: token.token,
			});
		} catch (error) {
			logger.error(
				`Error creating Personal Access Token with API: ${error instanceof Error ? error.message : ""}`,
			);
			logger.info(`Will re-attempt with Azure CLI`);

			responseText = await createPATWithAzCli({
				logger,
				data,
				url,
			});
		}

		const tokenParseResult = tokenResultSchema.safeParse(
			JSON.parse(responseText),
		);

		if (!tokenParseResult.success) {
			const errorMessage = `Error parsing the token result: ${fromZodError(tokenParseResult.error).message}`;
			throw new Error(errorMessage);
		}

		logger.info(`Personal Access Token created:
- name: ${tokenParseResult.data.patToken.displayName}
- scope: ${tokenParseResult.data.patToken.scope}
- validTo: ${tokenParseResult.data.patToken.validTo}`);

		return tokenParseResult.data;
	} catch (error) {
		const errorMessage = `Error creating Personal Access Token: 
${error instanceof Error ? error.message : JSON.stringify(error)}

Please ensure that:
1. Your Azure DevOps organization is connected with your Azure account / Microsoft Entra ID
2. You are logged into the Azure CLI (use \`az login\` to log in)

If you continue to have issues, consider creating a Personal Access Token with the Packaging read and write scopes manually in Azure DevOps and providing it to \`azdo-npm-auth\` using the \`--pat\` option.

You can create a PAT here: https://dev.azure.com/${organization}/_usersSettings/tokens`;
		throw new Error(errorMessage);
	}
}

function computeTokenExpiry(daysToExpiry: number | undefined) {
	if (!daysToExpiry) {
		return undefined;
	}

	const currentDate = new Date();
	const futureDate = new Date(currentDate);
	futureDate.setDate(currentDate.getDate() + daysToExpiry);

	return futureDate;
}

interface CreatePATRequestBody {
	allOrgs: boolean;
	displayName: string;
	scope: string;
	validTo?: string;
}

async function createPATWithApi({
	logger,
	data,
	url,
	token,
}: {
	logger: Logger;
	data: CreatePATRequestBody;
	url: string;
	token: string;
}) {
	logger.info(`Creating Personal Access Token with API:`);
	logger.info(JSON.stringify(data, null, 2));

	const response = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"X-TFS-FedAuthRedirect": "Suppress",
			"X-VSS-ForceMsaPassThrough": "True",
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const responseText = await response.text();
		const errorMessage = `HTTP error! status: ${response.status.toString()} - ${responseText}`;
		throw new Error(errorMessage);
	}

	logger.info(`Created Personal Access Token with API`);
	logger.info();

	return await response.text();
}

/**
 * Try to do the same thing with the Azure CLI
 *
 * az rest --method post --uri "https://vssps.dev.azure.com/johnnyreilly/_apis/Tokens/Pats?api-version=7.1-preview" --resource "https://management.core.windows.net/" --body '{ "displayName": "patDisplayName", "scope": "vso.packaging" }' --headers Content-Type=application/json
 *
 */
async function createPATWithAzCli({
	logger,
	data,
	url,
}: {
	logger: Logger;
	data: CreatePATRequestBody;
	url: string;
}) {
	logger.info(
		`Creating Personal Access Token with Azure CLI: ${JSON.stringify(data, null, 2)}`,
	);
	try {
		const { stdout } = await execa("az", [
			"rest",
			"--method",
			"post",
			"--uri",
			url,
			"--resource",
			"https://management.core.windows.net/",
			"--body",
			JSON.stringify(data),
			"--headers",
			"Content-Type=application/json",
		]);

		logger.info(`Created Personal Access Token with Azure CLI`);

		return stdout;
	} catch (error) {
		const errorMessage = `AZ CLI error! ${
			error instanceof ExecaError
				? // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					(error.stderr ?? "") // It's actually a string | undefined
				: error instanceof Error
					? error.message
					: "UNKNOWN ERROR"
		}`;
		throw new Error(errorMessage);
	}
}
