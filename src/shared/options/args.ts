export const options = {
	config: {
		short: "c",
		type: "string",
	},

	"what-if": {
		type: "boolean",
		short: "w",
	},

	organization: {
		short: "o",
		type: "string",
	},

	project: {
		short: "p",
		type: "string",
	},

	feed: {
		short: "f",
		type: "string",
	},

	registry: {
		short: "r",
		type: "string",
	},

	email: {
		short: "e",
		type: "string",
	},

	daysToExpiry: {
		short: "d",
		type: "string",
	},

	pat: {
		short: "t",
		type: "string",
	},

	help: {
		short: "h",
		type: "boolean",
	},

	version: {
		short: "v",
		type: "boolean",
	},
} as const;

export type ValidOption = keyof typeof options;

export interface DocOption {
	description: string;
	docsSection: "core" | "optional";
	multiple?: boolean;
	short: string;
	type: string;
}

// two modes: use resource group and subscription name to get branch resources, or pass explicit resource names

export const allArgOptions: Record<ValidOption, DocOption> = {
	config: {
		...options.config,
		description:
			"The location of the .npmrc file. Defaults to current directory",
		docsSection: "optional",
	},

	"what-if": {
		...options["what-if"],
		description:
			"If provided, will not write output to to a user .npmrc file; will instead print to stdout",
		docsSection: "optional",
	},

	organization: {
		...options.organization,
		description:
			"The Azure DevOps organization - only required if not parsing from the .npmrc file",
		docsSection: "optional",
	},

	project: {
		...options.project,
		description:
			"The Azure DevOps project - only required if not parsing from the .npmrc file and the feed is project-scoped",
		docsSection: "optional",
	},

	feed: {
		...options.feed,
		description:
			"The Azure Artifacts feed - only required if not parsing from the .npmrc file",
		docsSection: "optional",
	},

	registry: {
		...options.registry,
		description:
			"The registry to use, eg 'https://pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/' - only required if not parsing from the .npmrc file",
		docsSection: "optional",
	},

	email: {
		...options.email,
		description:
			"Allows users to supply an explicit email - if not supplied, the example ADO value will be used",
		docsSection: "optional",
	},

	daysToExpiry: {
		...options.daysToExpiry,
		description:
			"Allows users to supply an explicit number of days to expiry - if not supplied, then ADO will determine the expiry date",
		docsSection: "optional",
	},

	pat: {
		...options.pat,
		description:
			"Allows users to supply an explicit Personal Access Token (which must include the Packaging read and write scopes) - if not supplied, will be acquired from the Azure CLI",
		docsSection: "optional",
	},

	help: {
		...options.help,
		description: "Show help",
		docsSection: "core",
		type: "boolean",
	},

	version: {
		...options.version,
		description: "Show version",
		docsSection: "core",
	},
} as const;
