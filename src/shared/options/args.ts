export const options = {
	config: {
		short: "c",
		type: "string",
	},

	email: {
		short: "e",
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

	email: {
		...options.email,
		description:
			"Allows users to supply an explicit email - if not supplied, will be inferred from git user.config",
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
