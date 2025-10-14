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
	/** eg `@myorg:registry=https://pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/` */
	fullRegistryMatch: string | undefined;
	/** eg `johnnyreilly` */
	organization: string;
	/** eg `@myorg` */
	scope: string | undefined;
	/** eg `//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/` */
	urlWithoutRegistryAtEnd: string;
	/** eg `//pkgs.dev.azure.com/johnnyreilly/_packaging/npmrc-script-organization/npm/registry/` */
	urlWithoutRegistryAtStart: string;
}
