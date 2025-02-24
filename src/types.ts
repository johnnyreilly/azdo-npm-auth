export interface TokenResult {
	patToken: {
		displayName: string;
		validTo: string;
		scope: string;
		targetAccounts: string[];
		validFrom: string;
		authorizationId: string;
		token: string;
	};
	patTokenError: string;
}

export interface ParsedProjectNpmrc {
	organization: string;
	urlWithoutRegistryAtEnd: string;
	urlWithoutRegistryAtStart: string;
}

export interface Options {
	npmrcPath?: string;  // Optional path to the user's .npmrc file
}
